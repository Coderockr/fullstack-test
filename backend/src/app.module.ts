import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvestmentsModule } from './investments/investments.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, InvestmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
