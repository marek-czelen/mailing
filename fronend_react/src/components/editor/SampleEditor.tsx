import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Stack, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { 
  EditOutlined, 
  PreviewOutlined, 
  CodeOutlined, 
  DataObjectOutlined,
  MonitorOutlined,
  PhoneIphoneOutlined,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import { Reader } from '@usewaypoint/email-builder';
import { 
  useDocument, 
  useSelectedMainTab, 
  useSelectedScreenSize,
  useInspectorDrawerOpen,
  setSelectedMainTab, 
  setSelectedScreenSize,
  toggleInspectorDrawerOpen
} from './EditorContext';
import EditorBlock from './EditorBlock';
import PropertyPanel from './PropertyPanel';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const SampleEditor: React.FC = () => {
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  const handleTabChange = (_: unknown, value: string) => {
    if (value && ['editor', 'preview', 'json', 'html'].includes(value)) {
      setSelectedMainTab(value as any);
    }
  };

  const handleScreenSizeChange = (_: unknown, value: string) => {
    if (value && ['desktop', 'mobile'].includes(value)) {
      setSelectedScreenSize(value as any);
    }
  };

  const renderMainPanel = () => {
    const containerSx = {
      height: '100%',
      overflow: 'auto',
      ...(selectedScreenSize === 'mobile' && {
        margin: '32px auto',
        width: 370,
        height: 800,
        boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      })
    };

    switch (selectedMainTab) {
      case 'editor':
        return (
          <Box sx={containerSx}>
            <EditorBlock id="root" />
          </Box>
        );
      case 'preview':
        return (
          <Box sx={containerSx}>
            <Reader document={document} rootBlockId="root" />
          </Box>
        );
      case 'json':
        return (
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <pre style={{ 
              fontSize: '12px', 
              lineHeight: '1.4',
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(document, null, 2)}
            </pre>
          </Box>
        );
      case 'html':
        return (
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              HTML Export (Preview)
            </div>
            <pre style={{ 
              fontSize: '12px', 
              lineHeight: '1.4',
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {'<!-- HTML output would be generated here -->'}
            </pre>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Stack
          sx={{
            height: 49,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'white',
            px: 2,
          }}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Lewy panel - taby */}
          <ToggleButtonGroup
            value={selectedMainTab}
            exclusive
            onChange={handleTabChange}
            size="small"
          >
            <ToggleButton value="editor">
              <Tooltip title="Edit">
                <EditOutlined fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="preview">
              <Tooltip title="Preview">
                <PreviewOutlined fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="json">
              <Tooltip title="JSON">
                <DataObjectOutlined fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="html">
              <Tooltip title="HTML">
                <CodeOutlined fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Prawy panel - kontrolki */}
          <Stack direction="row" spacing={1}>
            {/* Przycisk panelu właściwości */}
            <ToggleButton 
              value="inspector"
              selected={inspectorDrawerOpen}
              onChange={toggleInspectorDrawerOpen}
              size="small"
            >
              <Tooltip title="Properties Panel">
                <SettingsIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            
            {/* Rozmiar ekranu */}
            <ToggleButtonGroup
              value={selectedScreenSize}
              exclusive
              onChange={handleScreenSizeChange}
              size="small"
            >
              <ToggleButton value="desktop">
                <Tooltip title="Desktop">
                  <MonitorOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Mobile">
                  <PhoneIphoneOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {/* Główny panel */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'hidden',
          backgroundColor: selectedMainTab === 'preview' ? '#f5f5f5' : 'white',
          display: 'flex'
        }}>
          {/* Główna zawartość */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'hidden'
          }}>
            {renderMainPanel()}
          </Box>
          
          {/* Panel właściwości */}
          {inspectorDrawerOpen && (
            <Box sx={{ 
              width: 300, 
              borderLeft: 1, 
              borderColor: 'divider',
              backgroundColor: 'white',
              p: 2,
              overflow: 'auto'
            }}>
              <PropertyPanel />
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SampleEditor;