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
  useCallback,
  useEffect,
  useRef,
  useState,
  useFocusOut,
  useMemo,
} from '@web-stories-wp/react';
import { __ } from '@web-stories-wp/i18n';
import { trackEvent } from '@web-stories-wp/tracking';
import { useVirtual } from 'react-virtual';
import { useGridViewKeys } from '@web-stories-wp/design-system';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import { CardGrid, useLayoutContext } from '../../../../components';
import {
  PageSizePropType,
  TemplatesPropType,
  TemplateActionsPropType,
} from '../../../../types';
import { useConfig } from '../../../config';
import { resolveRoute } from '../../../router';
import { useVirtualizedGridNavigation } from '../../../../../../story-editor/src/components/library/panes/shared/virtualizedPanelGrid';
import TemplateGridItem, { FOCUS_TEMPLATE_CLASS } from './templateGridItem';

const ScrollableContent = styled.div`
  height: 700px;
  overflow-y: scroll;
`;
function TemplateGridView({ children, pageSize, templates, templateActions }) {
  console.log({ pageSize });
  const { isRTL, apiCallbacks } = useConfig();
  const containerRef = useRef();
  const gridRef = useRef();
  const itemRefs = useRef({});

  const {
    actions: { scrollToTop },
  } = useLayoutContext();

  const [activeGridItemId, setActiveGridItemId] = useState(null);

  const handleUseStory = useCallback(
    ({ id, title }) => {
      trackEvent('use_template', {
        name: title,
        template_id: id,
      });
      templateActions.createStoryFromTemplate(id);
    },
    [templateActions]
  );

  const numColumns = Math.floor(
    containerRef.current?.getBoundingClientRect().width / pageSize.width || 1
  );
  const numRows = Math.ceil(templates.length / numColumns);
  console.log({
    length: templates.length,
    calculatedLength: numColumns * numRows,
  });
  console.log({ numColumns, numRows });
  // template size: { height, width }
  // containerRef.width / width
  const rowVirtualizer = useVirtual({
    size: numRows,
    parentRef: containerRef,
  });

  const columnVirtualizer = useVirtual({
    horizontal: true,
    size: numColumns,
    parentRef: containerRef,
  });

  console.log(rowVirtualizer);

  // const columnVirtualizer = useVirtual({
  //   horizontal: true,
  //   size: 2,
  //   parentRef: paneRef,
  //   estimateSize: useCallback(() => TEXT_SET_SIZE + PANEL_GRID_ROW_GAP, []),
  //   overscan: 0,
  // });

  // useGridViewKeys({
  //   containerRef,
  //   gridRef,
  //   itemRefs,
  //   isRTL,
  //   currentItemId: activeGridItemId,
  //   items: templates,
  // });

  // when keyboard focus changes and updated activeGridItemId
  // immediately focus the first interactive element in the grid item
  // for legibility, it's based on the FOCUS_TEMPLATE_CLASS
  useEffect(() => {
    if (activeGridItemId) {
      itemRefs.current?.[activeGridItemId]
        ?.querySelector(`.${FOCUS_TEMPLATE_CLASS}`)
        ?.focus();
    }
  }, [activeGridItemId]);

  useFocusOut(containerRef, () => setActiveGridItemId(null), []);

  return (
    <ScrollableContent ref={containerRef}>
      <CardGrid
        pageSize={pageSize}
        role="list"
        ref={gridRef}
        ariaLabel={__('Viewing available templates', 'web-stories')}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) =>
          columnVirtualizer.virtualItems.map((virtualColumn) => {
            const gridIndex =
              numColumns * virtualRow.index + virtualColumn.index;

            if (gridIndex > templates.length - 1) {
              return null;
            }

            const {
              id,
              centerTargetAction,
              slug,
              status,
              title,
              postersByPage,
            } = templates[gridIndex];
            const isActive = activeGridItemId === id;
            const posterSrc = postersByPage?.[0];
            const canCreateStory = Boolean(
              apiCallbacks?.createStoryFromTemplate
            );

            return (
              <TemplateGridItem
                detailLink={resolveRoute(centerTargetAction)}
                onCreateStory={() =>
                  canCreateStory ? handleUseStory({ id, title }) : null
                }
                onFocus={() => {
                  setActiveGridItemId(id);
                }}
                onSeeDetailsClick={scrollToTop}
                height={pageSize.height}
                id={id}
                isActive={isActive}
                key={slug}
                posterSrc={posterSrc}
                ref={(el) => {
                  itemRefs.current[id] = el;
                }}
                slug={slug}
                status={status}
                title={title}
              />
            );
          })
        )}
      </CardGrid>
      {children}
    </ScrollableContent>
  );
}

TemplateGridView.propTypes = {
  pageSize: PageSizePropType,
  templates: TemplatesPropType,
  templateActions: TemplateActionsPropType,
};
export default TemplateGridView;
