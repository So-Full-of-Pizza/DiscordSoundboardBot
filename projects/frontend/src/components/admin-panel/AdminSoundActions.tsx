import React, { FC, useCallback, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSWRConfig } from 'swr';
import Sound from '../../models/sound';
import { textInput, adminPanelDivider } from '../../styles/mixins';
import { defaultTheme } from '../../styles/themes';

const Divider = styled.hr`
  ${ adminPanelDivider }
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: left;
  
  > span {
    margin: 5px 7px 0px 0px;

    &:nth-child(2) {
      color: ${ props => props.theme.colors.borderRed };
    }

    &:last-child {
      color: ${ props => props.theme.colors.borderGreen };
      margin-right: 0;
    }
  }

  > input {
    ${ textInput }

    margin-bottom: 0;
    margin-right: 7px;
  }
`;

interface AdminSoundActionsProps {
  selectedSound: Sound;
  setSelectedSound: (sound: Sound) => void;
  showConfirmDelete: boolean;
  setShowConfirmDelete: (show: boolean) => void;
  showRenameInput: boolean;
  setShowRenameInput: (show: boolean) => void;
  previewRequest: (soundName: string) => Promise<void>
  setNotification: (text: string, color: string) => void;
}

const AdminSoundActions: FC<AdminSoundActionsProps> = ({
  selectedSound,
  setSelectedSound,
  showConfirmDelete,
  setShowConfirmDelete,
  showRenameInput,
  setShowRenameInput,
  previewRequest,
  setNotification,
}) => {
  const [renameInput, setRenameInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();

  const renameRequest = useCallback(async () => {
    if (!renameInput) return;
    const res = await fetch(`/api/sounds/${ selectedSound.name }/${ renameInput }`, { method: 'PUT' });
    if (res.status === 200) {
      setNotification(`Renamed sound "${ selectedSound.name }" to "${ renameInput }"`, '');
      setSelectedSound({ ...selectedSound, name: renameInput });
      setRenameInput('');
      setShowRenameInput(false);
      await mutate('/api/sounds');
    } else {
      setNotification('YIKES, something broke', defaultTheme.colors.borderRed);
    }
  }, [renameInput, selectedSound]);

  const soundDeleteRequest = useCallback(async () => {
    const res = await fetch(`/api/sounds/${ selectedSound?.name }`, { method: 'DELETE' });
    if (res.status === 200) {
      setNotification(`Deleted sound "${ selectedSound.name }" o7`, '');
      setShowConfirmDelete(false);
      setRenameInput('');
      setSelectedSound({ name: 'ded', id: 'nope', date: 'Dedcember 31st, 1969', isFavorite: false });
      await mutate('/api/sounds');
    } else {
      setNotification('YIKES, something broke', defaultTheme.colors.borderRed);
    }
  }, [selectedSound?.name]);

  useEffect(() => setRenameInput(selectedSound.name), [selectedSound.name]);

  useEffect(() => {
    if (showRenameInput)
      inputRef.current?.focus();
  }, [showRenameInput]);

  return (
    <>
      <div>
        <h3>Preview</h3>
        <span className='material-icons' role='presentation' onClick={ () => previewRequest(selectedSound.id) }>play_circle</span>
      </div>
      <Divider />
      { showRenameInput
        ? (
          <ActionContainer>
            <h3>Rename</h3>
            <span className='material-icons' role='presentation' onClick={ () => { setShowRenameInput(false); setRenameInput(selectedSound.name); } }>cancel</span>
            <input type='text' value={ renameInput } ref={ inputRef } onChange={ event => setRenameInput(event.currentTarget.value) } />
            <span className='material-icons' role='presentation' onClick={ renameRequest }>check</span>
          </ActionContainer>
        ) : (
          <div>
            <h3>Rename</h3>
            <span className='material-icons' role='presentation' onClick={ () => { setShowRenameInput(true); setShowConfirmDelete(false); } }>edit</span>
          </div>
        )}
      { showConfirmDelete ? (
        <ActionContainer>
          <h3>{`Delete sound "${ selectedSound.name }"?`}</h3>
          <span className='material-icons' role='presentation' onClick={ () => setShowConfirmDelete(false) }>cancel</span>
          <h3>CHOOSE</h3>
          <span className='material-icons' role='presentation' onClick={ soundDeleteRequest }>check</span>
        </ActionContainer>
      ) : (
        <div>
          <h3>Delete</h3>
          <span className='material-icons' role='presentation' onClick={ () => { setShowConfirmDelete(true); setShowRenameInput(false); } }>delete</span>
        </div>
      )}
    </>
  );
};

export default AdminSoundActions;
