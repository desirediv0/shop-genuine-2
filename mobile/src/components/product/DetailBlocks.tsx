import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme';
import type { DetailBlock } from '../../utils/productDetails';
import { Icon } from '../Icon';

/**
 * Renders parsed description blocks: label/value rows stacked (label above
 * value), so long values such as ingredients or nutrition wrap cleanly instead
 * of squeezing into a two-column table.
 */
export function DetailBlocks({ blocks }: { blocks: DetailBlock[] }) {
  return (
    <View>
      {blocks.map((block, i) => {
        const divider = i > 0 && <View style={styles.divider} />;
        switch (block.type) {
          case 'row':
            return (
              <View key={i}>
                {divider}
                <View style={styles.row}>
                  <Text style={styles.label}>{block.label}</Text>
                  <Text style={styles.value} selectable>
                    {block.value}
                  </Text>
                </View>
              </View>
            );
          case 'heading':
            return (
              <Text key={i} style={[styles.heading, i === 0 && styles.headingFirst]}>
                {block.text}
              </Text>
            );
          case 'bullet':
            return (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.paragraph}>{block.text}</Text>
              </View>
            );
          default:
            return (
              <Text key={i} style={[styles.paragraph, styles.paragraphSpaced]} selectable>
                {block.text}
              </Text>
            );
        }
      })}
    </View>
  );
}

/**
 * A titled card of description blocks that shows the first few and expands on
 * request — a full spec sheet runs to 17+ rows, which would bury everything
 * below it.
 */
export function ProductDetailsCard({
  title,
  blocks,
  visible = 5,
}: {
  title: string;
  blocks: DetailBlock[];
  visible?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!blocks.length) return null;

  const canExpand = blocks.length > visible + 1;
  const shown = expanded || !canExpand ? blocks : blocks.slice(0, visible);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        <DetailBlocks blocks={shown} />
        {canExpand ? (
          <Pressable
            onPress={() => setExpanded((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            style={styles.toggle}
            hitSlop={6}
          >
            <Text style={styles.toggleText}>
              {expanded ? 'Show less' : `View more details (${blocks.length - visible})`}
            </Text>
            <Icon name={expanded ? 'up' : 'down'} size={15} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** A section that starts closed — for shipping, returns and legal text. */
export function CollapsibleCard({ title, blocks }: { title: string; blocks: DetailBlock[] }) {
  const [open, setOpen] = useState(false);
  if (!blocks.length) return null;

  return (
    <View style={styles.collapsible}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.collapsibleHead}
      >
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <Icon name={open ? 'up' : 'down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open ? (
        <View style={styles.collapsibleBody}>
          <DetailBlocks blocks={blocks} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadow.card,
  },
  row: { paddingVertical: spacing.md, gap: 3 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  value: { ...typography.small, color: colors.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  heading: { ...typography.smallStrong, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xs },
  headingFirst: { marginTop: spacing.sm },
  paragraph: { ...typography.small, color: colors.text, flex: 1 },
  paragraphSpaced: { paddingVertical: spacing.sm },
  bullet: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 3 },
  bulletDot: { ...typography.small, color: colors.textMuted },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  toggleText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
  collapsible: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadow.card,
  },
  collapsibleHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  collapsibleTitle: { ...typography.smallStrong, color: colors.text },
  collapsibleBody: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
