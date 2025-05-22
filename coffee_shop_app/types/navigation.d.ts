import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type TabParamList = {
  home: undefined;
  chatRoom: undefined;
  order: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<TabParamList, T>;

export type TabBarIconProps = {
  color: string;
  focused?: boolean;
  size?: number;
}; 