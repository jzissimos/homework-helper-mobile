// Topic Selection Screen - Choose what to learn about before conversation
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../src/contexts/AuthContext'
import { TOPICS, getTopicsForAge, Topic } from '../../src/constants/topics'
import { Button } from '../../src/components/Button'
import { colors } from '../../src/theme/colors'

export default function TopicSelectScreen() {
  const { user } = useAuth()
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])

  useEffect(() => {
    if (user) {
      setAvailableTopics(getTopicsForAge(user.age))
    }
  }, [user])

  function handleStart() {
    if (selectedTopic) {
      router.push({
        pathname: '/(tabs)/conversation',
        params: { topic: selectedTopic.id },
      })
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What do you want to learn about?</Text>
        <Text style={styles.subtitle}>Choose a subject to get started</Text>
      </View>

      <View style={styles.topicGrid}>
        {availableTopics.map((topic) => {
          const isSelected = selectedTopic?.id === topic.id
          return (
            <TouchableOpacity
              key={topic.id}
              style={[
                styles.topicCard,
                isSelected && styles.topicCardSelected,
              ]}
              onPress={() => setSelectedTopic(topic)}
            >
              <Text style={styles.topicEmoji}>{topic.emoji}</Text>
              <Text style={[
                styles.topicName,
                isSelected && styles.topicNameSelected,
              ]}>
                {topic.name}
              </Text>
              <Text style={styles.topicDescription}>
                {topic.description}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.footer}>
        <Button
          title={selectedTopic ? `Start ${selectedTopic.name} Session` : 'Select a Topic'}
          onPress={handleStart}
          disabled={!selectedTopic}
          variant="primary"
        />
        <Button
          title="Back to Home"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  topicGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  topicCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  topicEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  topicName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  topicNameSelected: {
    color: colors.primary,
  },
  topicDescription: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    padding: 24,
    gap: 12,
  },
})
