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
import { within } from '@testing-library/react';

/**
 * Internal dependencies
 */
import Fixture from '../../../../../../karma/fixture';
import { TEMPLATES_GALLERY_ITEM_CENTER_ACTION_LABELS } from '../../../../../../constants';
import useApi from '../../../../../api/useApi';

describe('See template details modal', () => {
  let fixture;

  beforeEach(async () => {
    fixture = new Fixture();

    await fixture.render();

    await navigateToFirstTemplate();
  });

  afterEach(() => {
    fixture.restore();
  });

  async function navigateToFirstTemplate() {
    const exploreTemplatesMenuItem = fixture.screen.queryByRole('link', {
      name: /^Explore Templates/,
    });

    await fixture.events.click(exploreTemplatesMenuItem);

    const { templatesOrderById } = await getTemplatesState();

    const firstTemplate = getTemplateElementById(templatesOrderById[0]);

    const utils = within(firstTemplate);

    await fixture.events.hover(firstTemplate);

    const seeDetailsButton = utils.getByText(
      new RegExp(`^${TEMPLATES_GALLERY_ITEM_CENTER_ACTION_LABELS.template}$`)
    );

    await fixture.events.click(seeDetailsButton);
  }

  function getTemplateElementById(id) {
    const template = fixture.screen.getByTestId(`template-grid-item-${id}`);

    return template;
  }

  async function focusOnCardGallery() {
    let limit = 0;
    const cardGallery = fixture.screen.getByTestId('mini-cards-container');

    while (!cardGallery.contains(document.activeElement) && limit < 5) {
      // eslint-disable-next-line no-await-in-loop
      await fixture.events.keyboard.press('tab');
      limit++;
    }

    return cardGallery.contains(document.activeElement)
      ? Promise.resolve()
      : Promise.reject(new Error('could not focus on page list'));
  }

  async function getTemplatesState() {
    const {
      state: { templates },
    } = await fixture.renderHook(() => useApi());
    return templates;
  }

  async function getTemplateTitle(index) {
    const { templates, templatesOrderById } = await getTemplatesState();
    return templates[templatesOrderById[index]].title;
  }

  describe('Action: Navigate template details modal', () => {
    it('should update current template', async () => {
      const firstTemplate = await getTemplateTitle(0);
      const templateTitle = fixture.screen.getByTestId(
        `template-details-title`
      );

      await expect(templateTitle).toHaveTextContent(firstTemplate);

      const previousArrow = fixture.screen.getByRole('button', {
        name: /View previous template/,
      });
      const nextArrow = fixture.screen.getByRole('button', {
        name: /View next template/,
      });

      await nextArrow.click();
      await expect(templateTitle).toHaveTextContent(await getTemplateTitle(1));
      await expect(templateTitle).not.toHaveTextContent(firstTemplate);

      await previousArrow.click();
      await expect(templateTitle).toHaveTextContent(firstTemplate);
      await expect(templateTitle).not.toHaveTextContent(
        await getTemplateTitle(1)
      );
    });

    it('should update current template via keyboard', async () => {
      //close button should be in focus
      await fixture.events.keyboard.press('tab');
      const closeBtn = fixture.screen.getByRole('button', {
        name: /^Close$/,
      });
      expect(closeBtn).toEqual(document.activeElement);

      // enter should close modal
      await fixture.events.keyboard.press('Enter');
      expect(closeBtn).not.toEqual(document.activeElement);

      // open first template in modal
      await navigateToFirstTemplate();
      // escape should close modal
      await fixture.events.keyboard.press('Escape');
      expect(closeBtn).not.toEqual(document.activeElement);

      // open first template in modal
      await navigateToFirstTemplate();
      // navigate to 'Use Template' button
      await fixture.events.keyboard.press('tab');
      await fixture.events.keyboard.press('tab');
      const useTemplateBtn = fixture.screen.getByRole('button', {
        name: /to create new story/,
      });
      expect(useTemplateBtn).toEqual(document.activeElement);

      // navigate to gallery thumbnail
      await fixture.events.keyboard.press('tab');
      const page1 = fixture.screen.getByRole('button', { name: /Page 1/ });
      expect(page1).toEqual(document.activeElement);

      // Check current template
      const firstTemplate = await getTemplateTitle(0);
      const templateTitle = fixture.screen.getByTestId(
        `template-details-title`
      );
      await expect(templateTitle).toHaveTextContent(firstTemplate);

      //navigate to next template arrow
      await fixture.events.keyboard.press('tab');
      const nextArrow = fixture.screen.getByRole('button', {
        name: /View next template/,
      });
      expect(nextArrow).toEqual(document.activeElement);

      // navigate to next template
      await fixture.events.keyboard.press('Enter');
      await expect(templateTitle).not.toHaveTextContent(firstTemplate);
      await expect(templateTitle).toHaveTextContent(await getTemplateTitle(1));

      //navigate back to previous template
      await fixture.events.keyboard.shortcut('shift+tab');
      await fixture.events.keyboard.shortcut('shift+tab');
      const previousArrow = fixture.screen.getByRole('button', {
        name: /View previous template/,
      });
      expect(previousArrow).toEqual(document.activeElement);
      await fixture.events.keyboard.press('Enter');
      await expect(templateTitle).toHaveTextContent(firstTemplate);
      await expect(templateTitle).not.toHaveTextContent(
        await getTemplateTitle(1)
      );
    });
  });

  describe('Action: See template details modal', () => {
    it('should update the "Active Preview Page" when clicking on a "Thumbnail Preview Page"', async () => {
      const firstPage = fixture.screen.getByRole('button', { name: /Page 1/ });

      expect(firstPage).toBeTruthy();

      const activePage = fixture.screen.getByLabelText(
        'Active Page Preview - Page 1'
      );

      expect(activePage).toBeTruthy();

      const secondPage = fixture.screen.getByRole('button', { name: /Page 2/ });

      expect(secondPage).toBeTruthy();

      await fixture.events.click(secondPage);

      fixture.screen.getByLabelText('Active Page Preview - Page 2');

      expect(activePage).toBeTruthy();
    });

    it('should update the "Active Preview Page" when using keyboard to navigate gallery', async () => {
      await focusOnCardGallery();
      const page1 = fixture.screen.getByRole('button', { name: /Page 1/ });
      expect(page1).toEqual(document.activeElement);

      // go right by 1
      await fixture.events.keyboard.press('right');
      const page2 = fixture.screen.getByRole('button', { name: /Page 2/ });
      expect(page2).toEqual(document.activeElement);

      // go left 1
      await fixture.events.keyboard.press('left');
      expect(page1).toEqual(document.activeElement);

      // go left 1 (focus should remain on page 1)
      await fixture.events.keyboard.press('left');
      expect(page1).toEqual(document.activeElement);

      const page4 = fixture.screen.getByRole('button', { name: /Page 4/ });
      await fixture.events.keyboard.seq(({ press }) => [
        press('right'),
        press('right'),
        press('right'),
      ]);
      expect(page4).toEqual(document.activeElement);

      await fixture.events.keyboard.press('Enter');

      const activePreviewPage = fixture.screen.getByLabelText(
        'Active Page Preview - Page 4'
      );

      expect(activePreviewPage).toBeTruthy();
    });
  });
});
