import { Directory, File, Paths } from 'expo-file-system';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';

import {
  parseAppearancePreference,
  type AppearancePreference,
} from '@/design/appearancePreference';

export type { AppearancePreference } from '@/design/appearancePreference';

interface AppearanceContextValue {
  readonly isAppearanceHydrated: boolean;
  readonly appearancePreference: AppearancePreference;
  setAppearancePreference(
    preference: AppearancePreference,
  ): Promise<void>;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);
const APPEARANCE_DIRECTORY = 'startio-preferences';
const APPEARANCE_FILE = 'appearance.txt';

function createAppearanceFile() {
  const directory = new Directory(Paths.document, APPEARANCE_DIRECTORY);
  const file = new File(directory, APPEARANCE_FILE);
  return { directory, file };
}

function applyAppearancePreference(preference: AppearancePreference) {
  Appearance.setColorScheme(
    preference === 'system' ? 'unspecified' : preference,
  );
}

async function readAppearancePreference(): Promise<AppearancePreference> {
  const { file } = createAppearanceFile();
  if (!file.exists) {
    return 'system';
  }

  try {
    return parseAppearancePreference((await file.text()).trim());
  } catch {
    return 'system';
  }
}

async function writeAppearancePreference(
  preference: AppearancePreference,
): Promise<void> {
  const { directory, file } = createAppearanceFile();

  if (preference === 'system') {
    if (file.exists) {
      file.delete();
    }
    if (directory.exists && directory.list().length === 0) {
      directory.delete();
    }
    return;
  }

  directory.create({ idempotent: true, intermediates: true });
  if (!file.exists) {
    file.create({ intermediates: true });
  }
  file.write(preference);
}

export function AppearanceProvider({ children }: PropsWithChildren) {
  const [appearancePreference, setPreferenceState] =
    useState<AppearancePreference>('system');
  const [isAppearanceHydrated, setIsAppearanceHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    void readAppearancePreference().then((preference) => {
      if (!active) {
        return;
      }
      applyAppearancePreference(preference);
      setPreferenceState(preference);
      setIsAppearanceHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      appearancePreference,
      isAppearanceHydrated,
      async setAppearancePreference(preference) {
        applyAppearancePreference(preference);
        setPreferenceState(preference);
        await writeAppearancePreference(preference);
      },
    }),
    [appearancePreference, isAppearanceHydrated],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {isAppearanceHydrated ? children : null}
    </AppearanceContext.Provider>
  );
}

export function useAppearancePreference(): AppearanceContextValue {
  const value = useContext(AppearanceContext);
  if (!value) {
    throw new Error(
      'useAppearancePreference must be used inside AppearanceProvider',
    );
  }
  return value;
}
