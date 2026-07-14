/**
 * Inbox for messages sent to the user by their therapist (or the daily system
 * message). Reached from the bell icon in the Home header. Data comes from
 * `GET /supervision/messages`. Opening the screen marks all messages as seen
 * (clears the bell badge on Home).
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Screen, Header } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { PressableScale } from '../components/ui';
import { BellIcon, HeartHandshakeIcon, SendIcon, ShieldIcon, UserIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import { getSupervisionMessages, sendSupervisionMessage, SupervisionMessage } from '../lib/api';
import { setItem, StorageKeys } from '../lib/storage';

const toFa = (s: string) => s.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const formatWhen = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  const hm = `${p(d.getHours())}:${p(d.getMinutes())}`;
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return toFa(`امروز، ${hm}`);
  return toFa(`${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} - ${hm}`);
};

export const MessagesScreen: React.FC = () => {
  const { pop } = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<SupervisionMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await getSupervisionMessages();
      setMessages(list);
      setLoading(false);
      // opening the inbox = everything is now "seen"
      await setItem(StorageKeys.messagesSeenAt, new Date().toISOString());
    })();
  }, []);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await sendSupervisionMessage(body);
      // optimistic: show the sent message immediately
      setMessages(prev => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          body,
          sender_name: 'شما',
          is_auto: false,
          from_user: true,
          created_at: new Date().toISOString(),
        },
      ]);
      setDraft('');
    } catch {
      // silently keep the draft so the user can retry
    } finally {
      setSending(false);
    }
  };

  const canSend = draft.trim().length > 0 && !sending;

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="پیام‌های همراهی" onBack={pop} />
      <Screen contentStyle={{ paddingTop: spacing.md }}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} />
        ) : messages.length === 0 ? (
          <View style={styles.empty}>
            <Gradient colors={gradients.violet} style={styles.emptyIcon}>
              <BellIcon size={30} color={colors.white} />
            </Gradient>
            <Text style={styles.emptyTitle}>هنوز پیامی نداری</Text>
            <Text style={styles.emptyText}>
              پیامت را برای همراه متخصصت بنویس، یا منتظر بمان تا برایت پیام بفرستد.
            </Text>
          </View>
        ) : (
          messages.map((m, i) => <MessageBubble key={m.id} msg={m} index={i} formatWhen={formatWhen} />)
        )}
      </Screen>

      {/* compose bar */}
      <View style={[styles.compose, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="پیامت را برای همراهت بنویس…"
          placeholderTextColor={colors.textFaint}
          multiline
          textAlign="right"
        />
        <PressableScale onPress={handleSend} scaleTo={0.9}>
          <View style={[styles.sendBtn, !canSend && styles.sendBtnOff]}>
            {sending ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <SendIcon size={20} color={colors.white} />
            )}
          </View>
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
};

const MessageBubble: React.FC<{
  msg: SupervisionMessage;
  index: number;
  formatWhen: (iso: string) => string;
}> = ({ msg, index, formatWhen }) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 380,
      delay: index * 70,
      useNativeDriver: true,
    }).start();
  }, [index, v]);

  const mine = msg.from_user;
  const accent = mine ? colors.primary : msg.is_auto ? colors.calm : colors.primary;
  const tint = mine ? gradients.violet : msg.is_auto ? gradients.teal : gradients.violet;

  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}>
      {/* mine → align to the opposite side (row) with a filled brand bubble */}
      <View style={mine ? styles.rowMine : styles.row}>
        <Gradient colors={tint} style={styles.avatar}>
          {mine ? (
            <UserIcon size={18} color={colors.white} />
          ) : msg.is_auto ? (
            <ShieldIcon size={18} color={colors.white} />
          ) : (
            <HeartHandshakeIcon size={18} color={colors.white} />
          )}
        </Gradient>
        {mine ? (
          <View style={styles.bubbleMine}>
            <View style={styles.head}>
              <Text style={styles.whenMine}>{formatWhen(msg.created_at)}</Text>
              <Text style={styles.senderMine} numberOfLines={1}>شما</Text>
            </View>
            <Text style={styles.bodyMine}>{msg.body}</Text>
          </View>
        ) : (
          <View style={[styles.bubble, { borderRightColor: accent }]}>
            <View style={styles.head}>
              <Text style={styles.when}>{formatWhen(msg.created_at)}</Text>
              <Text style={[styles.sender, { color: accent }]} numberOfLines={1}>
                {msg.sender_name}
              </Text>
            </View>
            <Text style={styles.body}>{msg.body}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },

  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.soft,
  },
  emptyTitle: { fontSize: 17, color: colors.text, ...rtlText },
  emptyText: {
    fontFamily: font.family,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    writingDirection: 'rtl',
    paddingHorizontal: spacing.lg,
  },

  row: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  rowMine: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 2,
    ...shadow.soft,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderTopRightRadius: 6,
    borderRightWidth: 3,
    borderRightColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 6,
    ...shadow.card,
  },
  head: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  sender: { fontFamily: font.family, fontSize: 13.5, flexShrink: 1, textAlign: 'right', writingDirection: 'rtl' },
  when: { fontFamily: font.family, fontSize: 11, color: colors.textFaint },
  body: { fontSize: 14.5, color: colors.textBody, lineHeight: 26, ...rtlText },

  // user's own message — filled brand bubble on the opposite side
  bubbleMine: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    borderTopLeftRadius: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 6,
    ...shadow.card,
  },
  senderMine: { fontFamily: font.family, fontSize: 13.5, flexShrink: 1, color: colors.white, textAlign: 'right', writingDirection: 'rtl' },
  whenMine: { fontFamily: font.family, fontSize: 11, color: colors.primarySoft },
  bodyMine: { fontSize: 14.5, color: colors.white, lineHeight: 26, ...rtlText },

  // compose bar
  compose: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: font.family,
    fontSize: 14.5,
    color: colors.textBody,
    writingDirection: 'rtl',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  sendBtnOff: { backgroundColor: colors.textFaint },
});
