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

function removeMediaProperties({ pages, ...rest }) {
  return {
    pages: pages.map(reducePage),
    ...rest,
  };
}

function reducePage({ elements, ...rest }) {
  return {
    elements: elements.map(updateElement),
    ...rest,
  };
}

function updateElement(element) {
  if (!element.resource) {
    return element;
  }

  if ('local' in element.resource) {
    delete element.resource.local;
  }

  if ('isTrimming' in element.resource) {
    delete element.resource.isTrimming;
  }

  if ('isTranscoding' in element.resource) {
    delete element.resource.isTranscoding;
  }

  if ('isMuting' in element.resource) {
    delete element.resource.isMuting;
  }

  return element;
}

export default removeMediaProperties;
