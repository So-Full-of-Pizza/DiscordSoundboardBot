import React, { FC, useCallback } from 'react';
import styled from 'styled-components';
import { useWebSockets } from '../../contexts/websockets-context';
import { button } from '../../styles/mixins';
import debounce from '../../utils';

const SkipContainerMain = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0;
  height: 56%;
  flex-grow: 1;
  position: relative;
  z-index: 10;

  > button {
    ${ button }
    
    font-size: 1.2rem;
    color: white;
    background-color: ${ props => props.theme.colors.innerA };
    border: 5px solid ${ props => props.theme.colors.borderDefault };
    box-shadow: 0px 1px 8px 1px ${ props => props.theme.colors.shadowDefault };
    border-width: 5px;
    border-radius: 3px;
    width: 50%;
    margin: 6px 0px;

    &:first-child {
      margin-right: 6px;
    }
  }

  @media only screen and (max-width: 780px) {
    min-height: 40;
    margin: 0px 4px;

    > button {
      border-width: 3px;
      min-height: 50px;
    }
  }
`;

const SkipContainer: FC = () => {
  const { webSocket } = useWebSockets();
  const skipSound = useCallback(debounce(async (all?: boolean) => {
    webSocket?.send(JSON.stringify({ type: 'skip', data: all && 'all' }));
  }, 500, true), [webSocket]);

  return (
    <SkipContainerMain>
      <button type='button' onClick={ skipSound }>
        Skip one
      </button>
      <button type='button' onClick={ () => skipSound(true) }>
        Skip all
      </button>
    </SkipContainerMain>
  );
};

export default SkipContainer;
