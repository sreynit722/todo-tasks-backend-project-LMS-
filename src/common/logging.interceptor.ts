import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const start = Date.now();
    const line = (status: number) =>
      `${req.method} ${req.originalUrl} ${status} - ${Date.now() - start}ms`;

    return next.handle().pipe(
      tap({
        next: () => this.logger.log(line(res.statusCode)),
        error: (err) => {
          const status = err instanceof HttpException ? err.getStatus() : 500;
          if (status >= 500) this.logger.error(line(status));
          else this.logger.warn(line(status));
        },
      }),
    );
  }
}
