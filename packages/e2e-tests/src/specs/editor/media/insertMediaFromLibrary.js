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
import {
  createNewStory,
  deleteMedia,
  skipSuiteOnFirefox,
  uploadMedia,
} from '@web-stories-wp/e2e-test-utils';

describe('Inserting Media from Media Library', () => {
  // Firefox does not yet support file uploads with Puppeteer. See https://bugzilla.mozilla.org/show_bug.cgi?id=1553847.
  skipSuiteOnFirefox();

  let uploadedFiles;

  beforeEach(() => (uploadedFiles = []));

  afterEach(async () => {
    for (const file of uploadedFiles) {
      // eslint-disable-next-line no-await-in-loop
      await deleteMedia(file);
    }
  });

  // Uses the existence of the element's frame element as an indicator for successful insertion.
  // TODO https://github.com/google/web-stories-wp/issues/7107
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should insert an image by clicking on it', async () => {
    await createNewStory();

    const fileName = await uploadMedia('example-1.jpg', true);
    uploadedFiles.push(fileName);

    await page.waitForSelector('[data-testid="mediaElement-image"]');
    // Clicking will only act on the first element.
    await expect(page).toClick('[data-testid="mediaElement-image"]');

    await page.waitForSelector('[data-testid="frameElement"]:nth-of-type(2)');

    // First match is for the background element, second for the image.
    await expect(page).toMatchElement(
      '[data-testid="frameElement"]:nth-of-type(2)'
    );

    await expect(page).toMatchElement('[data-testid="imageElement"]');
  });
});
