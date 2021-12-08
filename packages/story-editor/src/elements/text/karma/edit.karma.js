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
import { waitFor } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { Fixture } from '../../../karma';
import { useStory } from '../../../app/story';

describe('TextEdit integration', () => {
  let fixture;

  beforeEach(async () => {
    fixture = new Fixture();

    await fixture.render();
    await fixture.collapseHelpCenter();
  });

  afterEach(() => {
    fixture.restore();
  });

  function repeatPress(key, count) {
    let remaining = count;
    const press = () => {
      if (remaining === 0) {
        return Promise.resolve(true);
      }
      remaining--;
      return fixture.events.keyboard.press(key).then(press);
    };
    return press();
  }

  it('should render ok', () => {
    expect(
      fixture.container.querySelector('[data-testid="fullbleed"]')
    ).toBeTruthy();
  });

  describe('add a text', () => {
    let frame;

    beforeEach(async () => {
      await fixture.events.click(fixture.editor.library.textAdd);
      await waitFor(() => fixture.editor.canvas.framesLayer.frames[1].node);
      frame = fixture.editor.canvas.framesLayer.frames[1].node;
    });

    it('should render initial content', () => {
      expect(frame.textContent).toEqual('Fill in some text');
    });

    describe('edit mode', () => {
      let editor;
      let editLayer;
      let boldToggle;

      beforeEach(async () => {
        await fixture.events.mouse.clickOn(frame, 30, 5);
        editor = fixture.querySelector('[data-testid="textEditor"]');
        editLayer = fixture.querySelector('[data-testid="editLayer"]');
        boldToggle = fixture.editor.inspector.designPanel.textStyle.bold;
      });

      it('should mount editor', async () => {
        expect(editor).toBeTruthy();
        expect(editLayer).toBeTruthy();
        await fixture.snapshot();
      });

      it('should handle a command, exit and save', async () => {
        // Increase the font size for ensuring the clicks to be in correct places.
        await fixture.events.click(
          fixture.editor.inspector.designPanel.textStyle.fontSize,
          { clickCount: 3 }
        );
        await fixture.events.keyboard.type('30');
        await fixture.events.keyboard.press('tab');
        // Give time for the font size to be applied.
        await fixture.events.sleep(100);

        // Select all.
        await fixture.events.mouse.clickOn(frame, 30, 5);
        await repeatPress('ArrowUp', 10);
        await fixture.events.keyboard.down('shift');
        await repeatPress('ArrowRight', 20);
        await fixture.events.keyboard.up('shift');

        expect(boldToggle.checked).toEqual(false);

        await fixture.snapshot('before mod+b');

        await fixture.events.keyboard.shortcut('mod+b');

        await fixture.snapshot('after mod+b');

        expect(boldToggle.checked).toEqual(true);

        // Exit edit mode by clicking right outside the editor.
        await fixture.events.mouse.seq(({ moveRel, down }) => [
          moveRel(editor, -10),
          down(),
        ]);

        expect(fixture.querySelector('[data-testid="textEditor"]')).toBeNull();

        // The element is still selected and updated.
        const storyContext = await fixture.renderHook(() => useStory());
        expect(storyContext.state.selectedElements[0].content).toEqual(
          '<span style="font-weight: 700">Fill in some text</span>'
        );

        // The content is updated in the frame.
        // @todo: What to do with `<p>` and containers?
        expect(frame.querySelector('p').innerHTML).toEqual(
          '<span style="font-weight: 700">Fill in some text</span>'
        );
      });
    });

    describe('shortcuts', () => {
      it('should enter/exit edit mode using the keyboard', async () => {
        // Enter edit mode using the Enter key
        expect(fixture.querySelector('[data-testid="textEditor"]')).toBeNull();
        await fixture.events.keyboard.press('Enter');
        expect(
          fixture.querySelector('[data-testid="textEditor"]')
        ).toBeDefined();
        await fixture.events.sleep(300);
        await fixture.events.keyboard.type('This is some test text.');

        // Exit edit mode using the Esc key
        await fixture.events.keyboard.press('Esc');
        await fixture.events.sleep(100);
        await waitFor(() =>
          expect(fixture.querySelector('[data-testid="textEditor"]')).toBeNull()
        );
        // The element is still selected and updated.
        const storyContext = await fixture.renderHook(() => useStory());
        expect(storyContext.state.selectedElements[0].content).toEqual(
          'This is some test text.'
        );
      });
    });
  });

  describe('add a multiline text element', () => {
    let frame;
    let textElement;
    let initialHeight;

    describe('edit mode', () => {
      it('should not change height when entering and exiting edit mode', async () => {
        await fixture.events.click(fixture.editor.library.textAdd);
        await waitFor(() => fixture.editor.canvas.framesLayer.frames[1].node);
        frame = fixture.editor.canvas.framesLayer.frames[1].node;
        const { width } = frame.getBoundingClientRect();

        // Enter edit mode.
        await fixture.events.keyboard.press('Enter');
        await fixture.events.sleep(300);
        await fixture.events.keyboard.type('This is some test text.');
        await fixture.events.keyboard.press('Enter');
        await fixture.events.keyboard.press('Enter');
        await fixture.events.keyboard.type('This is more test text.');
        await fixture.events.keyboard.press('Enter');

        // Get the initial height.
        textElement = fixture.querySelector('[data-testid="textEditor"]');
        initialHeight = textElement.getBoundingClientRect()?.height;

        await fixture.snapshot('Trailing and leading newlines, in edit mode');

        // Exit edit mode using the Esc key
        await fixture.events.keyboard.press('Esc');

        await fixture.snapshot(
          'Trailing and leading newlines, after edit mode'
        );

        const { height: heightAfterExitingEditMode } =
          frame.getBoundingClientRect();

        expect(initialHeight).toBeCloseTo(heightAfterExitingEditMode, 0);

        // Reenter edit mode
        await fixture.events.mouse.clickOn(
          frame,
          width / 2,
          heightAfterExitingEditMode / 2
        );
        textElement = fixture.querySelector('[data-testid="textEditor"]');

        const { height: heightAfterReenteringEditMode } =
          textElement.getBoundingClientRect();

        expect(heightAfterReenteringEditMode).toBeCloseTo(initialHeight, 0);
      });
    });
  });
});
