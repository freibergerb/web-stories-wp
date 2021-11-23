/*
 * Copyright 2021 Google LLC
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

const THREE_SECONDS = 3000;

/**
 * Seek video element to a given offset.
 *
 * @param {HTMLVideoElement} video Video element.
 * @param {number} [offset=0.99] Optional. Desired offset. Defaults to roughly the first frame.
 * @return {Promise<void>}
 */
function seekVideo(video, offset = 0.99) {
  if (video.currentTime === offset) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // The "suspend" event can be fired multiple times, even before the browser
    // has started seeking in the first place. Because of that, it's not
    // desired to reject on "suspend" straight away.
    // Instead, delay rejection in the hopes that the "canplay" event fires
    // in the meantime.
    video.addEventListener('suspend', (evt) => {
      const wait = setTimeout(() => {
        clearTimeout(wait);
        reject(evt);
      }, THREE_SECONDS);
    });
    video.addEventListener('error', reject);
    video.addEventListener('canplay', () => resolve(video), { once: true });

    video.currentTime = offset;
  });
}

export default seekVideo;
