import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { AddPostInput } from './input/add-post.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.entity';
import { GqlUser } from '../common/decorators/gql-user.decorator';

@Resolver(of => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(returns => [Post])
  async posts(): Promise<Post[]> {
    return this.postService.findAll();
  }

  @Mutation(returns => Post)
  @UseGuards(GqlAuthGuard)
  async addPost(
    @Args('addPostInput') addPostInput: AddPostInput,
    @GqlUser() user: User,
  ): Promise<Post> {
    return this.postService.save(addPostInput, user);
  }

  @Mutation(returns => Post)
  @UseGuards(GqlAuthGuard)
  async upvotePost(
    @Args({ name: 'postId', type: () => ID }) postId: number,
    @GqlUser() user: User,
  ): Promise<Post> {
    return this.postService.upvote(postId, user);
  }
}