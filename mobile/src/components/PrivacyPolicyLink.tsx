import React from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

/**
 * The live policy on the website, whichever server this build talks to: it is
 * the same page the Play listing points at (client/src/app/privacy-policy).
 * Public pages live on the main domain only — never on the API subdomain.
 */
export const PRIVACY_POLICY_URL = 'https://shopgenuine.online/privacy-policy';

export function openPrivacyPolicy() {
  Linking.openURL(PRIVACY_POLICY_URL).catch(() => {});
}

/**
 * Google Play requires the privacy policy to be reachable inside the app, not
 * only from the store listing. Opens it in the browser.
 */
export function PrivacyPolicyLink() {
  return (
    <Pressable
      onPress={openPrivacyPolicy}
      hitSlop={8}
      accessibilityRole="link"
      style={styles.wrap}
    >
      <Text style={styles.text}>Privacy policy</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', paddingVertical: 4 },
  text: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary, textDecorationLine: 'underline' },
});
