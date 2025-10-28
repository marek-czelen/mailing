import React, { createContext, useContext } from 'react';
import { create } from 'zustand';
import type { TReaderDocument } from '@usewaypoint/email-builder';

// Uproszczona wersja EditorContext z sample-editora
type EditorState = {
  document: TReaderDocument;
  selectedBlockId: string | null;
  selectedMainTab: 'editor' | 'preview' | 'json' | 'html';
  selectedScreenSize: 'desktop' | 'mobile';
  inspectorDrawerOpen: boolean;
  samplesDrawerOpen: boolean;
};

const useEditorStore = create<EditorState>(() => ({
  document: {
    root: {
      type: 'EmailLayout',
      data: {
        backdropColor: '#F5F5F5',
        canvasColor: '#FFFFFF',
        textColor: '#242424',
        fontFamily: 'MODERN_SANS',
        childrenIds: [],
      },
    },
  },
  selectedBlockId: null,
  selectedMainTab: 'editor',
  selectedScreenSize: 'desktop',
  inspectorDrawerOpen: true,
  samplesDrawerOpen: false,
}));

// Context dla aktualnego block ID
const EditorBlockContext = createContext<string | null>(null);

export const useCurrentBlockId = () => {
  const blockId = useContext(EditorBlockContext);
  if (!blockId) throw new Error('useCurrentBlockId must be used within EditorBlockProvider');
  return blockId;
};

export const EditorBlockProvider: React.FC<{ blockId: string; children: React.ReactNode }> = ({
  blockId,
  children,
}) => (
  <EditorBlockContext.Provider value={blockId}>
    {children}
  </EditorBlockContext.Provider>
);

// Hooks do zarządzania stanem
export const useDocument = () => useEditorStore((state) => state.document);
export const useSelectedBlockId = () => useEditorStore((state) => state.selectedBlockId);
export const useSelectedMainTab = () => useEditorStore((state) => state.selectedMainTab);
export const useSelectedScreenSize = () => useEditorStore((state) => state.selectedScreenSize);
export const useInspectorDrawerOpen = () => useEditorStore((state) => state.inspectorDrawerOpen);
export const useSamplesDrawerOpen = () => useEditorStore((state) => state.samplesDrawerOpen);

// Actions
export const setDocument = (document: Partial<TReaderDocument>) => {
  const currentDocument = useEditorStore.getState().document;
  useEditorStore.setState({
    document: { ...currentDocument, ...document },
  });
};

export const setSelectedBlockId = (selectedBlockId: string | null) => {
  useEditorStore.setState({ selectedBlockId });
};

export const setSelectedMainTab = (selectedMainTab: EditorState['selectedMainTab']) => {
  useEditorStore.setState({ selectedMainTab });
};

export const setSelectedScreenSize = (selectedScreenSize: EditorState['selectedScreenSize']) => {
  useEditorStore.setState({ selectedScreenSize });
};

export const toggleInspectorDrawerOpen = () => {
  const current = useEditorStore.getState().inspectorDrawerOpen;
  useEditorStore.setState({ inspectorDrawerOpen: !current });
};

export const toggleSamplesDrawerOpen = () => {
  const current = useEditorStore.getState().samplesDrawerOpen;
  useEditorStore.setState({ samplesDrawerOpen: !current });
};

export const resetDocument = (document: TReaderDocument) => {
  useEditorStore.setState({
    document,
    selectedBlockId: null,
  });
};