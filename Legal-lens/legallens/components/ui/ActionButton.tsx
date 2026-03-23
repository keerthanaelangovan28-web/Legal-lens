import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface ActionButtonProps {
  type: 'call' | 'alert' | 'record';
  onPress: () => void;
  isActive?: boolean;
  isLoading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  type, 
  onPress, 
  isActive = false, 
  isLoading = false 
}) => {
  const getStyles = () => {
    switch (type) {
      case 'call':
        return {
          container: [styles.container, styles.callContainer],
          text: styles.callText,
          icon: 'call' as const,
          label: 'Call a free lawyer now',
        };
      case 'alert':
        return {
          container: [styles.container, styles.alertContainer],
          text: styles.alertText,
          icon: 'notifications' as const,
          label: 'Alert my family',
        };
      case 'record':
        return {
          container: [
            styles.container, 
            isActive ? styles.recordActiveContainer : styles.recordInactiveContainer
          ],
          text: isActive ? styles.recordActiveText : styles.recordInactiveText,
          icon: isActive ? ('square' as const) : ('mic' as const),
          label: isActive ? 'Recording... Tap to stop' : 'Start silent recording',
        };
    }
  };

  const config = getStyles();

  return (
    <TouchableOpacity 
      style={config.container} 
      onPress={onPress} 
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={type === 'record' && !isActive ? theme.colors.textPrimary : 'white'} />
      ) : (
        <View style={styles.content}>
          <Ionicons 
            name={config.icon} 
            size={24} 
            color={type === 'record' && !isActive ? theme.colors.textPrimary : 'white'} 
          />
          <Text style={config.text}>{config.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callContainer: {
    backgroundColor: theme.colors.danger,
  },
  callText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertContainer: {
    backgroundColor: '#F5A623', // Amber
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recordInactiveContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recordInactiveText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  recordActiveContainer: {
    backgroundColor: theme.colors.danger,
    borderWidth: 2,
    borderColor: 'white',
  },
  recordActiveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
