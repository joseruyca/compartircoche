import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppFrame, ErrorBanner, LoadingState } from './src/components/ui';
import { BottomTabs } from './src/components/BottomTabs';
import { AppProvider, useApp } from './src/context/AppContext';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import { CreateGroupScreen } from './src/screens/CreateGroupScreen';
import { GroupHomeScreen } from './src/screens/GroupHomeScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { EventScreen } from './src/screens/EventScreen';
import { FinancesScreen } from './src/screens/FinancesScreen';
import { NewExpenseScreen } from './src/screens/NewExpenseScreen';
import { TournamentsScreen } from './src/screens/TournamentsScreen';
import { MatchScreen } from './src/screens/MatchScreen';
import { MembersScreen } from './src/screens/MembersScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

function Router() {
  const app = useApp();
  if (app.loading) return <LoadingState text="Preparando Grupli..."/>;

  const route = app.nav.name;
  const protectedRoute = !app.user && !['welcome','login','register'].includes(route);
  let screen: React.ReactNode = <WelcomeScreen />;
  const name = protectedRoute ? 'welcome' : route;

  if (name === 'login') screen = <LoginScreen />;
  else if (name === 'register') screen = <RegisterScreen />;
  else if (name === 'groups') screen = <GroupsScreen />;
  else if (name === 'createGroup') screen = <CreateGroupScreen />;
  else if (name === 'groupHome') screen = <GroupHomeScreen />;
  else if (name === 'calendar') screen = <CalendarScreen />;
  else if (name === 'event') screen = <EventScreen />;
  else if (name === 'finances') screen = <FinancesScreen />;
  else if (name === 'newExpense') screen = <NewExpenseScreen />;
  else if (name === 'tournaments') screen = <TournamentsScreen />;
  else if (name === 'match') screen = <MatchScreen />;
  else if (name === 'members') screen = <MembersScreen />;
  else if (name === 'profile') screen = <ProfileScreen />;

  const showBottom = app.user && ['groups','groupHome','calendar','finances','tournaments','members','profile'].includes(name);
  const activeGroup = app.activeGroup();

  return <View style={{ flex: 1 }}>
    <ErrorBanner message={app.error || app.info} onClose={app.clearMessage}/>
    {screen}
    {showBottom ? <BottomTabs active={name as any} onPress={(key) => {
      if (key === 'groups') app.reset('groups');
      else app.reset(key, activeGroup ? { groupId: activeGroup.id } : undefined);
    }}/> : null}
  </View>;
}

export default function App() {
  return <SafeAreaProvider><AppProvider><AppFrame><Router /></AppFrame></AppProvider></SafeAreaProvider>;
}
