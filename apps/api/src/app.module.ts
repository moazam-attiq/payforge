import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { resolve } from 'node:path';
import { LoggerModule } from 'nestjs-pino';
import { ApiExceptionFilter } from './common/http/api-exception.filter';
import { createLoggerParams } from './common/logging/logging';
import { Environment, validateEnvironment } from './config/environment';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { HealthModule } from './modules/health/health.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { OutboxModule } from './modules/outbox/outbox.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: resolve(__dirname, '../../../.env'),
      expandVariables: false,
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      isGlobal: true,
      validate: validateEnvironment,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) =>
        createLoggerParams(
          config.getOrThrow('NODE_ENV'),
          config.getOrThrow('LOG_LEVEL'),
        ),
    }),
    ApiKeysModule,
    AuditModule,
    AuthModule,
    CustomersModule,
    HealthModule,
    LedgerModule,
    MerchantsModule,
    OutboxModule,
    PaymentMethodsModule,
    PaymentsModule,
    ReconciliationModule,
    RefundsModule,
    TransactionsModule,
    WebhooksModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class AppModule {}
