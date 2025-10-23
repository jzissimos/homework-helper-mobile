// Tabs Layout - Bottom tab navigation for main app
import { Tabs } from 'expo-router'
import { colors } from '../../src/theme/colors'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="topic-select"
        options={{
          title: 'Choose Topic',
          tabBarLabel: 'Topics',
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="conversation"
        options={{
          title: 'Learning Session',
          tabBarLabel: 'Learn',
          href: null, // Hide from tab bar - access via topic-select
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  )
}
