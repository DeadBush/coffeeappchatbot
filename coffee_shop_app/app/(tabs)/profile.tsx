import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { authService } from '@/services/authService';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { fireBaseStorage } from '@/config/firebaseConfig';
import * as FileSystem from 'expo-file-system';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData.data || userData);
      } catch (error) {
        setUser(null);
      }
    };
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data.data || response.data);
      } catch (error) {
        setOrders([]);
      }
    };
    fetchUser();
    fetchOrders();
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Logout failed', 'Please try again.');
    }
  };

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditAvatar(user?.avatar || user?.avatarUrl || null);
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatarToFirebase = async (uri: string) => {
    setUploading(true);
    try {
      // Read file as a blob using FileSystem
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error('File does not exist');
  
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const fileName = `avatar/${user.id || user.email}_${Date.now()}`;
      const storageRef = ref(fireBaseStorage, fileName);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Upload failed', 'Could not upload avatar.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    let avatarUrl = user?.avatar || user?.avatarUrl || null;
    if (editAvatar && editAvatar !== avatarUrl && editAvatar.startsWith('file')) {
      // New local image selected, upload to Firebase
      const uploadedUrl = await uploadAvatarToFirebase(editAvatar);
      if (uploadedUrl) avatarUrl = uploadedUrl;
    }
    try {
      await api.put('/users', { name: editName, avatar: avatarUrl });
      setUser((prev: any) => ({ ...prev, name: editName, avatar: avatarUrl }));
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      Alert.alert('Update failed', 'Could not update profile.');
    }
  };

  if (loading) return <Text>Loading...</Text>;

  const avatarUrl = user?.avatar || user?.avatarUrl || null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>User Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.profileRow}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Entypo name="user" size={48} color="#C67C4E" />
            </View>
          )}
        </View>
        {user ? (
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Name: <Text style={styles.value}>{user.name}</Text></Text>
            <Text style={styles.label}>Email: <Text style={styles.value}>{user.email}</Text></Text>
          </View>
        ) : (
          <Text style={styles.error}>User not found.</Text>
        )}
      </View>

      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text style={styles.orderText}>Order #{item.id}</Text>
            <Text style={styles.orderText}>Total: ${item.total || 'N/A'}</Text>
            <Text style={styles.orderText}>Status: {item.status || 'N/A'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.error}>No orders found.</Text>}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={pickImage} style={styles.avatarEditContainer}>
              {editAvatar ? (
                <Image source={{ uri: editAvatar }} style={styles.avatarEdit} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Entypo name="user" size={48} color="#C67C4E" />
                </View>
              )}
              <Text style={styles.changeAvatarText}>Change Avatar</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
            />
            {uploading && <ActivityIndicator size="small" color="#C67C4E" style={{ marginVertical: 8 }} />}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit} disabled={uploading}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C67C4E',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#F5F6FA',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#C67C4E',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 4,
  },
  value: {
    color: '#2D3436',
    fontWeight: '600',
  },
  orderItem: {
    backgroundColor: '#F5F6FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  orderText: {
    fontSize: 15,
    color: '#636E72',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#C67C4E',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C67C4E',
    marginBottom: 18,
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarEdit: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F6FA',
    marginBottom: 6,
  },
  changeAvatarText: {
    color: '#C67C4E',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F5F6FA',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#C67C4E',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#636E72',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen; 