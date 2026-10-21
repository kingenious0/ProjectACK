import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Pure React Native vector icons built using precise geometry (circles, lines, shapes).
 * 100% zero extra native libraries, renders with native hardware acceleration on Fabric/Android.
 */

// Chats Tab / Bubble Icon
export const ChatBubbleIcon: React.FC<IconProps> = ({ size = 24, color = '#8696A0' }) => {
  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.72,
          borderRadius: size * 0.28,
          borderWidth: 2,
          borderColor: color,
          backgroundColor: 'transparent',
          position: 'relative',
        }}
      >
        {/* Tail */}
        <View
          style={{
            position: 'absolute',
            bottom: -3,
            left: 3,
            width: 0,
            height: 0,
            borderTopWidth: 5,
            borderTopColor: color,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </View>
  );
};

// Updates / Status Circle Icon
export const StatusCircleIcon: React.FC<IconProps> = ({ size = 24, color = '#8696A0' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: (size * 0.8) / 2,
          borderWidth: 2,
          borderColor: color,
          borderStyle: 'dashed',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.32,
            height: size * 0.32,
            borderRadius: (size * 0.32) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// Communities / Groups Icon (2 people silhouettes)
export const CommunitiesIcon: React.FC<IconProps> = ({ size = 24, color = '#8696A0' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
        {/* Person 1 */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
              borderWidth: 1.8,
              borderColor: color,
              marginBottom: 1,
            }}
          />
          <View
            style={{
              width: size * 0.44,
              height: size * 0.28,
              borderTopLeftRadius: size * 0.2,
              borderTopRightRadius: size * 0.2,
              borderWidth: 1.8,
              borderColor: color,
              borderBottomWidth: 0,
            }}
          />
        </View>

        {/* Person 2 (smaller behind) */}
        <View style={{ alignItems: 'center', opacity: 0.85, marginLeft: -4 }}>
          <View
            style={{
              width: size * 0.24,
              height: size * 0.24,
              borderRadius: (size * 0.24) / 2,
              borderWidth: 1.6,
              borderColor: color,
              marginBottom: 1,
            }}
          />
          <View
            style={{
              width: size * 0.34,
              height: size * 0.22,
              borderTopLeftRadius: size * 0.16,
              borderTopRightRadius: size * 0.16,
              borderWidth: 1.6,
              borderColor: color,
              borderBottomWidth: 0,
            }}
          />
        </View>
      </View>
    </View>
  );
};

// Settings Gear Icon
export const SettingsGearIcon: React.FC<IconProps> = ({ size = 24, color = '#8696A0' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: (size * 0.75) / 2,
          borderWidth: 2,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: (size * 0.28) / 2,
            borderWidth: 2,
            borderColor: color,
          }}
        />
        {/* Teeth */}
        <View style={{ position: 'absolute', top: -3, width: 3, height: 4, backgroundColor: color }} />
        <View style={{ position: 'absolute', bottom: -3, width: 3, height: 4, backgroundColor: color }} />
        <View style={{ position: 'absolute', left: -3, width: 4, height: 3, backgroundColor: color }} />
        <View style={{ position: 'absolute', right: -3, width: 4, height: 3, backgroundColor: color }} />
      </View>
    </View>
  );
};

// Search Magnifier Icon
export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = '#AEBAC1' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.58,
          height: size * 0.58,
          borderRadius: (size * 0.58) / 2,
          borderWidth: 2,
          borderColor: color,
          top: -2,
          left: -2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 2,
          right: 3,
          width: 2,
          height: size * 0.38,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
};

// Camera Icon
export const CameraIcon: React.FC<IconProps> = ({ size = 20, color = '#AEBAC1' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.65,
          borderRadius: 4,
          borderWidth: 1.8,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Lens */}
        <View
          style={{
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            borderWidth: 1.6,
            borderColor: color,
          }}
        />
        {/* Flash/notch */}
        <View
          style={{
            position: 'absolute',
            top: -3,
            left: 3,
            width: size * 0.25,
            height: 3,
            backgroundColor: color,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
      </View>
    </View>
  );
};

// 3 Dots Menu (More Vertical)
export const MoreVertIcon: React.FC<IconProps> = ({ size = 20, color = '#AEBAC1' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', gap: 3 }}>
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
    </View>
  );
};

// Back Arrow Icon
export const BackArrowIcon: React.FC<IconProps> = ({ size = 22, color = '#E9EDEF' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Horizontal stem */}
      <View style={{ width: size * 0.65, height: 2, backgroundColor: color, position: 'absolute' }} />
      {/* Upper arrow wing */}
      <View
        style={{
          position: 'absolute',
          left: 4,
          top: size * 0.28,
          width: size * 0.35,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      {/* Lower arrow wing */}
      <View
        style={{
          position: 'absolute',
          left: 4,
          bottom: size * 0.28,
          width: size * 0.35,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
};

// Send Arrow Icon (WhatsApp Paperplane)
export const SendIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: size * 0.42,
          borderTopColor: 'transparent',
          borderBottomWidth: size * 0.42,
          borderBottomColor: 'transparent',
          borderLeftWidth: size * 0.68,
          borderLeftColor: color,
          marginLeft: 3,
        }}
      />
    </View>
  );
};

// Lock / Vault Icon
export const LockIcon: React.FC<IconProps> = ({ size = 18, color = '#8696A0' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Shackle */}
      <View
        style={{
          width: size * 0.45,
          height: size * 0.42,
          borderTopLeftRadius: size * 0.22,
          borderTopRightRadius: size * 0.22,
          borderWidth: 2,
          borderColor: color,
          borderBottomWidth: 0,
          marginBottom: -1,
        }}
      />
      {/* Body */}
      <View
        style={{
          width: size * 0.72,
          height: size * 0.5,
          backgroundColor: color,
          borderRadius: 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: 2, height: 4, backgroundColor: '#111B21' }} />
      </View>
    </View>
  );
};

// Code Tag </> Icon
export const CodeTagIcon: React.FC<IconProps> = ({ size = 18, color = '#8696A0' }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 2 }}>
      {/* Left chevron < */}
      <View
        style={{
          width: 6,
          height: 6,
          borderLeftWidth: 1.8,
          borderBottomWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {/* Slash / */}
      <View
        style={{
          width: 1.8,
          height: 10,
          backgroundColor: color,
          transform: [{ rotate: '20deg' }],
        }}
      />
      {/* Right chevron > */}
      <View
        style={{
          width: 6,
          height: 6,
          borderRightWidth: 1.8,
          borderTopWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
};
