import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';

type Child = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  birthdate: string;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['children'],
    queryFn: () => api.get<Child[]>('/api/children'),
    retry: false,
    onSuccess: (data) => {
      console.log('Children data received:', data);
      console.log('Number of children:', data?.length);
    },
    onError: (error) => {
      console.error('Error fetching children:', error);
    },
  });

  const addChild = useMutation({
    mutationFn: (childData: { firstName: string; lastName: string; birthdate: string; profileImageUrl?: string }) =>
      api.post('/api/children', childData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['children'] });
      Alert.alert('Success', 'Child added successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', (error as Error).message);
    },
  });

  const deleteChild = useMutation({
    mutationFn: (childId: string) => api.delete(`/api/children/${childId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['children'] });
      Alert.alert('Success', 'Child deleted successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', (error as Error).message);
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const handleAddChild = () => {
    navigation.navigate('AddChild' as never);
  };

  const handleDeleteChild = (childId: string, childName: string) => {
    Alert.alert(
      'Delete Child',
      `Are you sure you want to delete ${childName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteChild.mutate(childId)
        }
      ]
    );
  };

  if (isLoading) return <Centered><Text>Loading…</Text></Centered>;
  if (error) return <Centered><Text>Network error - start backend with: npm run dev</Text></Centered>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Children</Text>
        <TouchableOpacity onPress={handleAddChild} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#16a34a" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={data || []}
        keyExtractor={(item, index) => item.id || `child-${index}`}
        renderItem={({ item }) => {
          console.log('Rendering child:', item.id, item.firstName, item.lastName);
          const birthDate = new Date(item.birthdate);
          const isValidDate = !isNaN(birthDate.getTime());
          
          return (
            <View style={styles.card}>
              {item.profileImageUrl ? (
                <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color="#6b7280" />
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.cardSubtitle}>
                  {isValidDate ? `Born ${birthDate.toLocaleDateString()}` : 'Birth date not set'}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No children yet</Text>
            <Text style={styles.emptySubtitle}>Add your first child to get started</Text>
            <Button title="Add Child" onPress={handleAddChild} style={styles.emptyButton} />
          </View>
        }
        contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
      />
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}><Text>{children}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  addButton: { padding: 8 },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  avatarPlaceholder: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#f3f4f6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#6b7280' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  emptyButton: { paddingHorizontal: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
