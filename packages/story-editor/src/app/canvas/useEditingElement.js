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
  useReducer,
  useRef,
  useCallback,
  useMemo,
  useState,
} from '@googleforcreators/react';

function useEditingElement() {
  const [state, dispatch] = useReducer(reducer, {
    editingElement: null,
    editingElementState: {},
  });
  const [nodesById, setNodesById] = useState({});

  const clearEditing = useCallback(() => {
    dispatch({ editingElement: null });
  }, []);

  const setEditingElementWithoutState = useCallback((id) => {
    dispatch({ editingElement: id });
  }, []);

  const setEditingElementWithState = useCallback((id, editingState) => {
    dispatch({ editingElement: id, editingElementState: editingState });
  }, []);

  const setNodeForElement = useCallback(
    (id, ref) => setNodesById((oldNodes) => ({ ...oldNodes, [id]: ref })),
    [setNodesById]
  );

  // Immutable frame lookup for imperative actions.
  const nodesByIdRef = useRef(null);
  nodesByIdRef.current = nodesById;
  const getNodeForElement = useCallback((id) => nodesByIdRef.current[id], []);

  const { editingElement, editingElementState } = state;
  return useMemo(
    () => ({
      nodesById,
      editingElement,
      editingElementState,
      setEditingElementWithState,
      setEditingElementWithoutState,
      clearEditing,
      getNodeForElement,
      setNodeForElement,
    }),
    [
      nodesById,
      editingElement,
      editingElementState,
      setEditingElementWithState,
      setEditingElementWithoutState,
      clearEditing,
      getNodeForElement,
      setNodeForElement,
    ]
  );
}

function reducer(state, { editingElement, editingElementState = {} }) {
  return {
    ...state,
    editingElement,
    editingElementState,
  };
}

export default useEditingElement;
