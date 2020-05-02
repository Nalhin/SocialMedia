import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { GraphqlConfigService } from '../../../src/config/graphql.config';
import { GraphqlTestConfigService } from '../../config/graphql.config';
import { TypeOrmConfigService } from '../../../src/config/typeorm.config';
import { TypeOrmTestConfigService } from '../../config/typeorm.config';
import { userFactory } from '../../factories/user.factory';
import { TypeOrmTestUtils } from '../../utils/typeorm-test.utils';
import { gql } from 'apollo-server-express';
import { GQL } from '../constants';
import { authHeaderFactory } from '../../factories/auth.factory';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let testUtils: TypeOrmTestUtils;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GraphqlConfigService)
      .useClass(GraphqlTestConfigService)
      .overrideProvider(TypeOrmConfigService)
      .useClass(TypeOrmTestConfigService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    testUtils = new TypeOrmTestUtils();
    await testUtils.startServer();
  });

  afterEach(async () => {
    await testUtils.closeServer();
  });

  describe('users query', () => {
    const query = gql`
      query {
        users {
          username
          id
          email
        }
      }
    `.loc?.source.body;

    it('should return users', async () => {
      const users = await userFactory.buildManyAsync(testUtils.saveMany, 2);

      const gqlReg = {
        query,
      };

      const result = await request(app.getHttpServer())
        .post(GQL)
        .send(gqlReg)
        .expect(200);

      expect(result.body.data.users.length).toBe(users.length);
    });
  });

  describe('user query', () => {
    const query = gql`
      query user($username: String!) {
        user(username: $username) {
          username
          id
          email
        }
      }
    `.loc?.source.body;

    it('should return user with given username', async () => {
      const user = await userFactory.buildOneAsync(testUtils.saveOne);

      const gqlReg = {
        query,
        variables: {
          username: user.username,
        },
      };

      const result = await request(app.getHttpServer())
        .post(GQL)
        .send(gqlReg)
        .expect(200);

      expect(result.body.data.user.username).toBe(user.username);
    });
  });

  describe('removeUser mutation', () => {
    const query = gql`
      mutation remove($input: ID!) {
        removeUser(id: $input) {
          username
        }
      }
    `.loc?.source.body;

    it('should remove user, and return removed user', async () => {
      const user = await userFactory.buildOneAsync(testUtils.saveOne);

      const gqlReq = {
        query,
        variables: {
          input: user.id,
        },
      };

      const result = await request(app.getHttpServer())
        .post(GQL)
        .send(gqlReq)
        .set('Authorization', authHeaderFactory(user))
        .expect(200);

      expect(result.body.data.removeUser.username).toBe(user.username);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
