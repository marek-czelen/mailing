import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Divider,
  Stack
} from '@mui/material';
import { 
  useDocument, 
  useSelectedBlockId, 
  setDocument,
  setSelectedBlockId 
} from './EditorContext';

const PropertyPanel: React.FC = () => {
  const document = useDocument();
  const selectedBlockId = useSelectedBlockId();
  
  if (!selectedBlockId || !document[selectedBlockId]) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Właściwości
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Wybierz blok, aby edytować jego właściwości
        </Typography>
      </Box>
    );
  }
  
  const selectedBlock = document[selectedBlockId];
  
  const updateBlockProperty = (property: string, value: any) => {
    const updatedBlock = {
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        props: {
          ...selectedBlock.data?.props,
          [property]: value
        }
      }
    };
    
    setDocument({
      [selectedBlockId]: updatedBlock
    });
  };
  
  const renderTextProperties = () => (
    <Stack spacing={2}>
      <TextField
        label="Tekst"
        value={selectedBlock.data?.props?.text || ''}
        onChange={(e) => updateBlockProperty('text', e.target.value)}
        multiline
        rows={3}
        fullWidth
        size="small"
      />
      <TextField
        label="Rozmiar czcionki"
        type="number"
        value={selectedBlock.data?.style?.fontSize || 16}
        onChange={(e) => updateBlockProperty('fontSize', parseInt(e.target.value))}
        fullWidth
        size="small"
      />
      <FormControl fullWidth size="small">
        <InputLabel>Wyrównanie</InputLabel>
        <Select
          value={selectedBlock.data?.style?.textAlign || 'left'}
          onChange={(e) => updateBlockProperty('textAlign', e.target.value)}
        >
          <MenuItem value="left">Do lewej</MenuItem>
          <MenuItem value="center">Do środka</MenuItem>
          <MenuItem value="right">Do prawej</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
  
  const renderButtonProperties = () => (
    <Stack spacing={2}>
      <TextField
        label="Tekst przycisku"
        value={selectedBlock.data?.props?.text || ''}
        onChange={(e) => updateBlockProperty('text', e.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        label="URL"
        value={selectedBlock.data?.props?.url || ''}
        onChange={(e) => updateBlockProperty('url', e.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        label="Kolor tła"
        type="color"
        value={selectedBlock.data?.style?.backgroundColor || '#007bff'}
        onChange={(e) => updateBlockProperty('backgroundColor', e.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        label="Kolor tekstu"
        type="color"
        value={selectedBlock.data?.style?.color || '#ffffff'}
        onChange={(e) => updateBlockProperty('color', e.target.value)}
        fullWidth
        size="small"
      />
    </Stack>
  );
  
  const renderContainerProperties = () => (
    <Stack spacing={2}>
      <TextField
        label="Kolor tła"
        type="color"
        value={selectedBlock.data?.style?.backgroundColor || '#ffffff'}
        onChange={(e) => updateBlockProperty('backgroundColor', e.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        label="Padding (px)"
        type="number"
        value={selectedBlock.data?.style?.padding?.top || 20}
        onChange={(e) => {
          const padding = parseInt(e.target.value);
          updateBlockProperty('padding', { 
            top: padding, 
            bottom: padding, 
            left: padding, 
            right: padding 
          });
        }}
        fullWidth
        size="small"
      />
    </Stack>
  );
  
  const renderImageProperties = () => (
    <Stack spacing={2}>
      <TextField
        label="URL obrazu"
        value={selectedBlock.data?.props?.url || ''}
        onChange={(e) => updateBlockProperty('url', e.target.value)}
        fullWidth
        size="small"
        placeholder="https://example.com/image.jpg"
      />
      <TextField
        label="Tekst alternatywny"
        value={selectedBlock.data?.props?.alt || ''}
        onChange={(e) => updateBlockProperty('alt', e.target.value)}
        fullWidth
        size="small"
        placeholder="Opis obrazu"
      />
      <TextField
        label="Link (opcjonalnie)"
        value={selectedBlock.data?.props?.linkHref || ''}
        onChange={(e) => updateBlockProperty('linkHref', e.target.value)}
        fullWidth
        size="small"
        placeholder="https://example.com"
      />
      <FormControl fullWidth size="small">
        <InputLabel>Wyrównanie</InputLabel>
        <Select
          value={selectedBlock.data?.style?.textAlign || 'center'}
          onChange={(e) => updateBlockProperty('textAlign', e.target.value)}
        >
          <MenuItem value="left">Do lewej</MenuItem>
          <MenuItem value="center">Do środka</MenuItem>
          <MenuItem value="right">Do prawej</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Szerokość max (px)"
        type="number"
        value={selectedBlock.data?.style?.maxWidth || 400}
        onChange={(e) => updateBlockProperty('maxWidth', parseInt(e.target.value) + 'px')}
        fullWidth
        size="small"
      />
      
      <Divider sx={{ my: 1 }} />
      
      {/* Upload obrazu */}
      <Button
        variant="contained"
        component="label"
        size="small"
        fullWidth
        sx={{ mb: 1 }}
      >
        📁 Wybierz plik obrazu
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // W rzeczywistej aplikacji tutaj byłby upload do serwera
              // Na razie użyjemy URL.createObjectURL dla podglądu
              const imageUrl = URL.createObjectURL(file);
              updateBlockProperty('url', imageUrl);
              updateBlockProperty('alt', file.name.split('.')[0]);
            }
          }}
        />
      </Button>
      
      <Typography variant="caption" color="text.secondary">
        Przykładowe obrazy:
      </Typography>
      
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {[
          { url: 'https://via.placeholder.com/600x300/FF6B6B/FFFFFF?text=Newsletter+Header', name: 'Header' },
          { url: 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Product+Image', name: 'Produkt' },
          { url: 'https://via.placeholder.com/800x200/45B7D1/FFFFFF?text=Banner', name: 'Banner' },
          { url: 'https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=Logo', name: 'Logo' }
        ].map((img, index) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            onClick={() => {
              updateBlockProperty('url', img.url);
              updateBlockProperty('alt', img.name);
            }}
            sx={{ fontSize: '10px', minWidth: 'auto', px: 1 }}
          >
            {img.name}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
  
  const renderProperties = () => {
    switch (selectedBlock.type) {
      case 'Text':
        return renderTextProperties();
      case 'Button':
        return renderButtonProperties();
      case 'Container':
        return renderContainerProperties();
      case 'Image':
        return renderImageProperties();
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Brak dostępnych właściwości dla tego typu bloku
          </Typography>
        );
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Właściwości
      </Typography>
      
      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
        {selectedBlock.type} Block
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {renderProperties()}
      
      <Divider sx={{ my: 2 }} />
      
      <Stack spacing={1}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={() => {
            if (selectedBlockId && selectedBlockId !== 'root') {
              const originalBlock = document[selectedBlockId];
              const newBlockId = `block_${Date.now()}`;
              const duplicatedBlock = JSON.parse(JSON.stringify(originalBlock));
              
              // Znajdź rodzica i dodaj duplikat
              const updatedDocument = { ...document };
              updatedDocument[newBlockId] = duplicatedBlock;
              
              // Znajdź rodzica i dodaj nowy blok do jego childrenIds
              Object.keys(updatedDocument).forEach(blockId => {
                const block = updatedDocument[blockId];
                if (block.data?.childrenIds?.includes(selectedBlockId)) {
                  const index = block.data.childrenIds.indexOf(selectedBlockId);
                  updatedDocument[blockId] = {
                    ...block,
                    data: {
                      ...block.data,
                      childrenIds: [
                        ...block.data.childrenIds.slice(0, index + 1),
                        newBlockId,
                        ...block.data.childrenIds.slice(index + 1)
                      ]
                    }
                  };
                }
                if (block.data?.props?.childrenIds?.includes(selectedBlockId)) {
                  const index = block.data.props.childrenIds.indexOf(selectedBlockId);
                  updatedDocument[blockId] = {
                    ...block,
                    data: {
                      ...block.data,
                      props: {
                        ...block.data.props,
                        childrenIds: [
                          ...block.data.props.childrenIds.slice(0, index + 1),
                          newBlockId,
                          ...block.data.props.childrenIds.slice(index + 1)
                        ]
                      }
                    }
                  };
                }
              });
              
              setDocument(updatedDocument);
              setSelectedBlockId(newBlockId);
            }
          }}
          disabled={selectedBlockId === 'root'}
        >
          Duplikuj blok
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          size="small"
          fullWidth
          onClick={() => {
          if (selectedBlockId && selectedBlockId !== 'root') {
            // Znajdź rodzica i usuń blok z jego childrenIds
            const updatedDocument = { ...document };
            
            // Usuń blok
            delete updatedDocument[selectedBlockId];
            
            // Znajdź i zaktualizuj rodziców
            Object.keys(updatedDocument).forEach(blockId => {
              const block = updatedDocument[blockId];
              if (block.data?.childrenIds?.includes(selectedBlockId)) {
                updatedDocument[blockId] = {
                  ...block,
                  data: {
                    ...block.data,
                    childrenIds: block.data.childrenIds.filter(
                      (id: string) => id !== selectedBlockId
                    )
                  }
                };
              }
              if (block.data?.props?.childrenIds?.includes(selectedBlockId)) {
                updatedDocument[blockId] = {
                  ...block,
                  data: {
                    ...block.data,
                    props: {
                      ...block.data.props,
                      childrenIds: block.data.props.childrenIds.filter(
                        (id: string) => id !== selectedBlockId
                      )
                    }
                  }
                };
              }
            });
            
            setDocument(updatedDocument);
            
            // Wyczyść selekcję
            setSelectedBlockId(null);
          }
        }}
        disabled={selectedBlockId === 'root'}
      >
        Usuń blok
      </Button>
      </Stack>
    </Box>
  );
};

export default PropertyPanel;