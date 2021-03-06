import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { AddPostInput } from './input/add-post.input';
import { UseGuards } from '@nestjs/common';
import { User } from '../user/user.entity';
import { GqlUser } from '../common/decorators/gql-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Input } from '../graphql/args/input.args';

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {
  }

  @Query((_returns) => [Post])
  async posts(): Promise<Post[]> {
    return this.postService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => Post)
  async addPost(
    @Input() addPostInput: AddPostInput,
    @GqlUser() user: User,
  ): Promise<Post> {
    return this.postService.save(addPostInput, user);
  }
}
