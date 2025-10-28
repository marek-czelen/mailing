import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useDocument, setDocument, useSelectedBlockId, setSelectedBlockId } from './EditorContext';
import { EditorBlockProvider, useCurrentBlockId } from './EditorContext';

// Funkcja do tworzenia nowego bloku
const createNewBlock = (blockType: string) => {
  const baseBlock = {
    type: blockType,
    data: {}
  };

  switch (blockType) {
    case 'Text':
      return {
        ...baseBlock,
        data: {
          text: 'Wprowadź tekst...',
          fontSize: 16,
          textAlign: 'left' as const
        }
      };
    case 'Button':
      return {
        ...baseBlock,
        data: {
          text: 'Kliknij tutaj',
          url: '#',
          size: 'medium' as const,
          buttonColor: '#3f51b5',
          textColor: '#ffffff'
        }
      };
    case 'Container':
      return {
        ...baseBlock,
        data: {
          childrenIds: [],
          backgroundColor: '#ffffff',
          padding: { top: 20, bottom: 20, left: 20, right: 20 }
        }
      };
    case 'Image':
      return {
        ...baseBlock,
        data: {
          props: { 
            url: 'https://via.placeholder.com/400x200/cccccc/666666?text=Obraz',
            alt: 'Opis obrazu',
            linkHref: ''
          },
          style: {
            padding: { top: 16, bottom: 16, left: 24, right: 24 },
            textAlign: 'center'
          }
        }
      };
    default:
      return baseBlock;
  }
};

interface EditorBlockProps {
  id: string;
}

// Uproszczony komponent bloku edytora
const EditorBlock: React.FC<EditorBlockProps> = ({ id }) => {
  const document = useDocument();
  const block = document[id];

  if (!block) {
    return <div>Block not found: {id}</div>;
  }

  return (
    <EditorBlockProvider blockId={id}>
      <div style={{ minHeight: '50px', padding: '8px', border: '1px dashed #ccc', margin: '4px 0' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          {block.type} (ID: {id})
        </div>
        
        {/* Renderuj zawartość bloku w zależności od typu */}
        {block.type === 'EmailLayout' && (
          <EmailLayoutEditor block={block} />
        )}
        
        {block.type === 'Text' && (
          <TextEditor block={block} />
        )}
        
        {block.type === 'Button' && (
          <ButtonEditor block={block} />
        )}
        
        {block.type === 'Container' && (
          <ContainerEditor block={block} />
        )}
        
        {block.type === 'Image' && (
          <ImageEditor block={block} />
        )}
        
        {/* Dodaj więcej typów bloków według potrzeb */}
      </div>
    </EditorBlockProvider>
  );
};

// Komponent dla EmailLayout
const EmailLayoutEditor: React.FC<{ block: any }> = ({ block }) => {
  const childrenIds = block.data?.childrenIds || [];
  const currentBlockId = useCurrentBlockId();
  
  const handleAddBlock = (blockType: string) => {
    const newBlockId = `block_${Date.now()}`;
    const newBlock = createNewBlock(blockType);
    
    // Zaktualizuj dokument - dodaj nowy blok i zaktualizuj rodzica
    setDocument({
      [newBlockId]: newBlock,
      [currentBlockId]: {
        ...block,
        data: {
          ...block.data,
          childrenIds: [...childrenIds, newBlockId]
        }
      }
    });
  };
  
  return (
    <div style={{ 
      backgroundColor: block.data?.canvasColor || '#ffffff',
      color: block.data?.textColor || '#000000',
      minHeight: '200px',
      padding: '20px'
    }}>
      <div style={{ fontSize: '14px', marginBottom: '10px' }}>
        Email Layout
      </div>
      
      {childrenIds.length === 0 ? (
        <AddBlockButton onAdd={handleAddBlock} />
      ) : (
        <>
          {childrenIds.map((childId: string) => (
            <EditorBlock key={childId} id={childId} />
          ))}
          <AddBlockButton onAdd={handleAddBlock} />
        </>
      )}
    </div>
  );
};

// Komponent dla Text
const TextEditor: React.FC<{ block: any }> = ({ block }) => {
  const text = block.data?.props?.text || 'Empty text block';
  const currentBlockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === currentBlockId;
  
  const handleClick = () => {
    setSelectedBlockId(currentBlockId);
  };
  
  return (
    <div 
      onClick={handleClick}
      style={{
        padding: '8px',
        border: isSelected ? '2px solid #1976d2' : '1px dashed #ccc',
        margin: '5px 0',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f3f7ff' : 'transparent'
      }}
    >
      <div style={{ marginBottom: '5px', fontSize: '12px', color: '#666' }}>Text Block</div>
      <div>{text}</div>
    </div>
  );
};

// Komponent dla Button
const ButtonEditor: React.FC<{ block: any }> = ({ block }) => {
  const text = block.data?.props?.text || 'Button';
  const url = block.data?.props?.url || '#';
  const currentBlockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === currentBlockId;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedBlockId(currentBlockId);
  };
  
  return (
    <div
      onClick={handleClick}
      style={{
        padding: '8px',
        border: isSelected ? '2px solid #1976d2' : '1px dashed #ccc',
        margin: '5px 0',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f3f7ff' : 'transparent'
      }}
    >
      <div style={{ marginBottom: '5px', fontSize: '12px', color: '#666' }}>Button Block</div>
      <button 
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {text}
      </button>
      <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>URL: {url}</div>
    </div>
  );
};

// Komponent dla Container
const ContainerEditor: React.FC<{ block: any }> = ({ block }) => {
  const childrenIds = block.data?.props?.childrenIds || [];
  const currentBlockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === currentBlockId;
  
  const handleAddBlock = (blockType: string) => {
    const newBlockId = `block_${Date.now()}`;
    const newBlock = createNewBlock(blockType);
    
    // Zaktualizuj dokument - dodaj nowy blok i zaktualizuj kontener
    setDocument({
      [newBlockId]: newBlock,
      [currentBlockId]: {
        ...block,
        data: {
          ...block.data,
          props: {
            ...block.data?.props,
            childrenIds: [...childrenIds, newBlockId]
          }
        }
      }
    });
  };
  
  const handleClick = () => {
    setSelectedBlockId(currentBlockId);
  };
  
  return (
    <div 
      onClick={handleClick}
      style={{ 
        border: isSelected ? '2px solid #1976d2' : '1px dashed #ddd', 
        padding: '10px', 
        margin: '5px 0',
        backgroundColor: isSelected ? '#f3f7ff' : block.data?.style?.backgroundColor || '#ffffff',
        cursor: 'pointer',
        borderRadius: '4px'
      }}
    >
      <div style={{ marginBottom: '5px', fontSize: '12px', color: '#666' }}>Container Block</div>
      
      {childrenIds.length === 0 ? (
        <AddBlockButton onAdd={handleAddBlock} />
      ) : (
        <>
          {childrenIds.map((childId: string) => (
            <EditorBlock key={childId} id={childId} />
          ))}
          <AddBlockButton onAdd={handleAddBlock} />
        </>
      )}
    </div>
  );
};

// Komponent dla Image
const ImageEditor: React.FC<{ block: any }> = ({ block }) => {
  const url = block.data?.props?.url || 'https://via.placeholder.com/400x200';
  const alt = block.data?.props?.alt || 'Image';
  const linkHref = block.data?.props?.linkHref || '';
  const currentBlockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === currentBlockId;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedBlockId(currentBlockId);
  };
  
  return (
    <div
      onClick={handleClick}
      style={{
        padding: '8px',
        border: isSelected ? '2px solid #1976d2' : '1px dashed #ccc',
        margin: '5px 0',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f3f7ff' : 'transparent',
        textAlign: 'center'
      }}
    >
      <div style={{ marginBottom: '5px', fontSize: '12px', color: '#666' }}>Image Block</div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {linkHref ? (
          <a 
            href={linkHref} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'inline-block' }}
          >
            <img 
              src={url}
              alt={alt}
              style={{ 
                maxWidth: '100%',
                maxHeight: '200px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/400x200/cccccc/666666?text=Błąd+ładowania';
              }}
            />
          </a>
        ) : (
          <img 
            src={url}
            alt={alt}
            style={{ 
              maxWidth: '100%',
              maxHeight: '200px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x200/cccccc/666666?text=Błąd+ładowania';
            }}
          />
        )}
        {linkHref && (
          <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
            🔗 Link: {linkHref}
          </div>
        )}
      </div>
    </div>
  );
};

// Przycisk dodawania nowych bloków
const AddBlockButton: React.FC<{ onAdd?: (blockType: string) => void }> = ({ onAdd }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddBlock = (blockType: string) => {
    if (onAdd) {
      onAdd(blockType);
    }
    handleClose();
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      margin: '10px 0',
      padding: '10px',
      border: '2px dashed #ccc',
      borderRadius: '4px'
    }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleClick}
        sx={{ backgroundColor: '#1976d2' }}
      >
        Dodaj blok
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleAddBlock('Text')}>Tekst</MenuItem>
        <MenuItem onClick={() => handleAddBlock('Button')}>Przycisk</MenuItem>
        <MenuItem onClick={() => handleAddBlock('Image')}>Obraz</MenuItem>
        <MenuItem onClick={() => handleAddBlock('Container')}>Kontener</MenuItem>
      </Menu>
    </div>
  );
};

export default EditorBlock;