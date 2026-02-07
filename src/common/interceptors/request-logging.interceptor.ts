import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const route = request ? `${request.method} ${request.originalUrl ?? request.url}` : 'UNKNOWN';
    if (request) {
      const paramsSnapshot = {
        params: request.params ?? {},
        query: request.query ?? {},
      };
      this.logger.log(`${route} params=${JSON.stringify(paramsSnapshot)}`);
    }

    return next.handle().pipe(
      tap((response) => {
        this.logger.log(`${route} response=${this.safeStringify(response)}`);
      }),
    );
  }

  private safeStringify(payload: unknown): string {
    try {
      return JSON.stringify(payload);
    } catch (error) {
      return `[unserializable:${error instanceof Error ? error.message : 'unknown'}]`;
    }
  }
}
