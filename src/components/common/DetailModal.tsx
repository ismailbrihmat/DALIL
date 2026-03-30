import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}

const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Helper component for info rows
export const InfoRow: React.FC<{ label: string; value: string; isLink?: boolean; onPress?: () => void }> = ({
  label,
  value,
  isLink,
  onPress,
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {isLink ? (
      <TouchableOpacity onPress={onPress}>
        <Text style={[styles.infoValue, styles.linkText]}>{value}</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.infoValue}>{value}</Text>
    )}
  </View>
);

// Helper component for sections
export const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// Helper to open Google Maps
export const openInGoogleMaps = (url?: string, query?: string) => {
  if (url) {
    Linking.openURL(url);
  } else if (query) {
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(query)}`);
  }
};

// Helper to make a phone call
export const callPhone = (phoneNumber?: string) => {
  if (phoneNumber) {
    Linking.openURL(`tel:${phoneNumber.replace(/\s/g, '')}`);
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E6D5CC',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2E8E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#1B365D',
    fontWeight: '600',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B365D',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#724838',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Extra padding for bottom buttons
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C65D3B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E8E5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#5D3C30',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1B365D',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  linkText: {
    color: '#C65D3B',
    textDecorationLine: 'underline',
  },
});

export default DetailModal;
