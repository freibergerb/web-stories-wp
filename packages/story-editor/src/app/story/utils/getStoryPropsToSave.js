/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * External dependencies
 */
import { getStoryMarkup } from '@googleforcreators/output';

/**
 * Internal dependencies
 */
import objectPick from '../../../utils/objectPick';
import getAllProducts from './getAllProducts';

function getStoryPropsToSave({ story, pages, metadata, flags }) {
  const { terms, ...propsFromStory } = objectPick(story, [
    'title',
    'status',
    'author',
    'date',
    'modified',
    'slug',
    'excerpt',
    'featuredMedia',
    'publisherLogo',
    'password',
    'currentStoryStyles',
    'globalStoryStyles',
    'autoAdvance',
    'defaultPageDuration',
    'backgroundAudio',
    'terms',
  ]);
  const products = getAllProducts(pages);
  const content = getStoryMarkup(story, pages, metadata, flags);
  return {
    content,
    pages,
    ...propsFromStory,
    ...terms,
    products,
  };
}

export default getStoryPropsToSave;
