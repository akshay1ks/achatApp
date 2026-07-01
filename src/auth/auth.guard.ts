import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { isIndianPhone } from '../common/phone.util';

/**
 * Verifies the Supabase access token and enforces that only users with an
 * Indian (+91) phone number can call the API.
 *
 * Supports BOTH token styles:
 *  - Legacy HS256 tokens   -> verified with SUPABASE_JWT_SECRET
 *  - New asymmetric tokens -> verified against the project's JWKS endpoint
 *    (Project Settings -> JWT Keys -> new signing keys, ES256/RS256)
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly jwks: JwksClient | null = process.env.SUPABASE_URL
    ? new JwksClient({
        jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
        cache: true,
        cacheMaxAge: 10 * 60 * 1000,
        rateLimit: true,
      })
    : null;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const decoded: any = jwt.decode(token, { complete: true });
    if (!decoded) throw new UnauthorizedException('Malformed token');
    const alg: string = decoded.header?.alg;

    let payload: any;
    try {
      if (alg === 'HS256') {
        const secret = process.env.SUPABASE_JWT_SECRET;
        if (!secret) throw new Error('SUPABASE_JWT_SECRET not set');
        payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
      } else {
        // New asymmetric signing keys (ES256 / RS256) -> verify via JWKS.
        if (!this.jwks) throw new Error('SUPABASE_URL not set');
        const signingKey = await this.jwks.getSigningKey(decoded.header.kid);
        const publicKey = signingKey.getPublicKey();
        payload = jwt.verify(token, publicKey, {
          algorithms: ['ES256', 'RS256'],
        });
      }
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const phone: string = payload.phone
      ? payload.phone.startsWith('+')
        ? payload.phone
        : '+' + payload.phone
      : '';

    if (!isIndianPhone(phone)) {
      throw new UnauthorizedException('Only Indian (+91) phone numbers allowed');
    }

    req.user = { id: payload.sub, phone };
    return true;
  }
}
