// CustomNodes.jsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';

// Bestehende DiamondNode
export const DiamondNode = ({ data, style = {}, selected }) => {
  const defaultStyle = {
    width: 100,
    height: 100,
    background: '#B0BEC5',
    color: 'white',
    border: '1px solid #455A64',
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />
      <div
        style={{
          ...defaultStyle,
          ...style,
          width: 100,
          height: 100,
          transform: 'rotate(45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 0,
        }}
      >
        <div
          style={{
            transform: 'rotate(-45deg)',
            padding: '10px',
            textAlign: 'center',
            color: style.color || 'white',
            maxWidth: '80%',
            wordBreak: 'break-word',
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />
    </>
  );
};

// Bestehende CircleNode
export const CircleNode = ({ data, style = {}, selected }) => {
  const defaultStyle = {
    width: 100,
    height: 100,
    background: '#B0BEC5',
    color: 'white',
    border: '1px solid #455A64',
    borderRadius: '50%',
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        style={{
          ...defaultStyle,
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ padding: '10px', textAlign: 'center', color: style.color || 'white' }}>
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

// Neue ArrowRectangleNode
export const ArrowRectangleNode = ({ data, style = {}, selected }) => {
  const defaultStyle = {
    width: 150,
    height: 60,
    background: '#B0BEC5',
    color: 'white',
    border: '1px solid #455A64',
    position: 'relative',
  };

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ top: '50%' }} />
      <div
        style={{
          ...defaultStyle,
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
        }}
      >
        {/* Pfeil auf der rechten Seite */}
        <div
          style={{
            position: 'absolute',
            right: -10,
            width: 0,
            height: 0,
            borderTop: '15px solid transparent',
            borderBottom: '15px solid transparent',
            borderLeft: `10px solid ${style.background || defaultStyle.background}`,
          }}
        />
        <div
          style={{
            padding: '10px',
            textAlign: 'center',
            color: style.color || 'white',
            maxWidth: '80%',
            wordBreak: 'break-word',
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ top: '50%' }} />
    </>
  );
};

// Neue HexagonNode
export const HexagonNode = ({ data, style = {}, selected }) => {
  const defaultStyle = {
    width: 100,
    height: 100,
    background: '#B0BEC5',
    color: 'white',
    border: '1px solid #455A64',
  };

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ top: '50%' }} />
      <div
        style={{
          ...defaultStyle,
          ...style,
          width: 100,
          height: 100,
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            padding: '10px',
            textAlign: 'center',
            color: style.color || 'white',
            maxWidth: '80%',
            wordBreak: 'break-word',
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ top: '50%' }} />
    </>
  );
};