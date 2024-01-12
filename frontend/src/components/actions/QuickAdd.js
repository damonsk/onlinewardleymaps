import React, { memo, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ComponentIcon,
  InertiaIcon,
  EcosystemIcon,
  MarketIcon,
  BuyMethodIcon,
  BuildMethodIcon,
  OutSourceMethodIcon,
  GenericNoteIcon,
} from '../symbols/icons';

import { lightTheme } from '../../theme/index';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { TextField } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

function QuickAdd(props) {
  let icons = [
    {
      Icon: ComponentIcon,
      template: (val, y, x) => `component ${val} [${y}, ${x}]`,
    },
    {
      Icon: InertiaIcon,
      template: (val, y, x) => `component ${val} [${y}, ${x}] inertia`,
    },
    { Icon: MarketIcon, template: (val, y, x) => `market ${val} [${y}, ${x}]` },
    {
      Icon: EcosystemIcon,
      template: (val, y, x) => `ecosystem ${val} [${y}, ${x}]`,
    },
    {
      Icon: BuyMethodIcon,
      template: (val, y, x) => `component ${val} [${y}, ${x}] (buy)`,
    },
    {
      Icon: BuildMethodIcon,
      template: (val, y, x) => `component ${val} [${y}, ${x}] (build)`,
    },
    {
      Icon: OutSourceMethodIcon,
      template: (val, y, x) => `component ${val} [${y}, ${x}] (outsource)`,
    },
    {
      Icon: GenericNoteIcon,
      template: (val, y, x) => `note ${val} [${y}, ${x}]`,
    },
  ];
  const {
    newComponentContext,
    mutateMapText,
    setNewComponentContext,
    mapText,
    mapStyleDefs,
  } = props;
  const [showAdd, setShowAdd] = useState(false);
  const [typeToUse, setTypeToUse] = useState(0);
  const [value, setValue] = React.useState('');
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleChaneOfComponent = (evt) => {
    setTypeToUse(evt.target.value);
  };
  const cancelShowAdd = useCallback(() => {
    setShowAdd(false);
    setNewComponentContext(null);
  }, [setShowAdd, setNewComponentContext]);

  useEffect(() => {
    const handleEscape = (k) => {
      if (k.key === 'Escape') {
        document.removeEventListener('keyup', handleEscape);
        cancelShowAdd();
      }
    };

    if (newComponentContext) {
      setShowAdd(true);
      document.addEventListener('keyup', handleEscape);
    }
    return function cleanup() {
      document.removeEventListener('keyup', handleEscape);
    };
  }, [newComponentContext, cancelShowAdd]);

  function addNewComponent() {
    if (value.trim().length === 0) return;
    setShowAdd(false);
    const componentString = icons[typeToUse].template(
      value.trim(),
      newComponentContext.y,
      newComponentContext.x,
    );
    mutateMapText(mapText + `\r\n${componentString}`);
    setValue('');
  }

  return (
    <>
      <ThemeProvider theme={lightTheme}>
        <Dialog
          open={showAdd}
          onClose={cancelShowAdd}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Quick Add</DialogTitle>
          <DialogContent>
            <FormControl
              sx={{
                m: 1,
                minWidth: 80,
                '.MuiInputBase-root:before': {
                  border: '0',
                },
              }}
            >
              <InputLabel id="type-autowidth-label">Type</InputLabel>
              <Select
                labelId="type-autowidth-label"
                id="demo-simple-select-autowidth"
                value={typeToUse}
                onChange={handleChaneOfComponent}
                label="Type"
                variant="standard"
              >
                {icons.map((available, idx) => {
                  const { Icon } = available;
                  return (
                    <MenuItem key={idx} value={idx}>
                      <Icon mapStyleDefs={mapStyleDefs} hideLabel={false} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 80 }}>
              <TextField
                id="outlined-multiline-flexible"
                label="Text"
                value={value}
                onChange={handleChange}
                autoFocus={true}
                variant="standard"
                sx={{
                  '& .MuiInput-input': {
                    height: '40px',
                  },
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') addNewComponent();
                }}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelShowAdd}>Cancel</Button>
            <Button onClick={addNewComponent}>Add</Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </>
  );
}

QuickAdd.propTypes = {
  setNewComponentContext: PropTypes.func,
  newComponentContext: PropTypes.object,
  mutateMapText: PropTypes.func,
};

export default memo(QuickAdd);
