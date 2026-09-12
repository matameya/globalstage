import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { Tournament } from '@/types';
import { colors } from '@/theme/colors';

export function TournamentMap({
  tournaments,
  onSelect,
}: {
  tournaments: Tournament[];
  onSelect: (id: string) => void;
}) {
  const first = tournaments[0];
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: first?.lat ?? 39.8283,
        longitude: first?.lng ?? -98.5795,
        latitudeDelta: first ? 8 : 40,
        longitudeDelta: first ? 8 : 40,
      }}
    >
      {tournaments.map((tItem) => (
        <Marker
          key={tItem.id}
          coordinate={{ latitude: tItem.lat, longitude: tItem.lng }}
          title={tItem.name}
          description={`${tItem.city}, ${tItem.stateOrProvince}`}
          pinColor={colors.primary}
          onCalloutPress={() => onSelect(tItem.id)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
