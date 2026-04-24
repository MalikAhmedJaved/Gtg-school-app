import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../../contexts/LanguageContext';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getDocumentByTypeId,
  getDocumentHistory,
  uploadDocument,
  STATUS_META,
} from '../../services/compliance';

function formatDate(iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, opts);
}

function formatDateTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString(
    undefined,
    { hour: 'numeric', minute: '2-digit' }
  )}`;
}

const makeHistoryIcon = (colors) => ({
  uploaded: { icon: 'cloud-upload', color: colors.info },
  approved: { icon: 'checkmark-circle', color: colors.success },
  rejected: { icon: 'close-circle', color: colors.error },
  expired: { icon: 'time', color: colors.warning },
});

export default function DocumentDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const HISTORY_ICON = useMemo(() => makeHistoryIcon(colors), [colors]);
  const { t } = useLanguage();
  const { typeId } = route.params || {};

  const [item, setItem] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getDocumentByTypeId(typeId);
    setItem(data);
    if (data?.document?.id) {
      const h = await getDocumentHistory(data.document.id);
      setHistory(h);
    } else {
      setHistory([]);
    }
    setLoading(false);
  }, [typeId]);

  useEffect(() => {
    load();
  }, [load]);

  const pickAndUpload = async () => {
    // Using image picker as a stand-in until expo-document-picker is added.
    // On a real backend build this will be replaced by a flow that also
    // accepts PDFs via expo-document-picker and streams directly to S3.
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        t('app.compliance.permissionTitle', 'Permission needed'),
        t('app.compliance.permissionBody', 'Please allow photo access to upload documents.')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const fileName =
      asset.fileName ||
      (Platform.OS === 'ios' ? 'upload.jpg' : asset.uri.split('/').pop() || 'upload.jpg');

    try {
      setUploading(true);
      const updated = await uploadDocument(typeId, { fileName, uri: asset.uri });
      setItem(updated);
      if (updated.document?.id) {
        const h = await getDocumentHistory(updated.document.id);
        setHistory(h);
      }
      Alert.alert(
        t('app.compliance.uploadSuccess', 'Uploaded'),
        t(
          'app.compliance.uploadSuccessBody',
          'Document uploaded. A manager will review it shortly.'
        )
      );
    } catch (e) {
      Alert.alert(
        t('app.compliance.uploadError', 'Upload failed'),
        t('app.compliance.uploadErrorBody', 'Could not upload the document. Please try again.')
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading || !item) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { type, category, document, status } = item;
  const meta = STATUS_META[status];
  const isMissing = status === 'missing';
  const isRejected = status === 'rejected';
  const hasExpiry = type.renewalMonths !== null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {type.name}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={[styles.statusCard, { borderLeftColor: meta.color }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '15' }]}>
              <Ionicons name={category.icon} size={22} color={category.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryLabel}>{category.name}</Text>
              <Text style={styles.description}>{type.description}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
            </View>
            {type.required ? (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>
                  {t('app.compliance.required', 'Required')}
                </Text>
              </View>
            ) : null}
          </View>

          {isRejected && document?.notes ? (
            <View style={styles.rejectionBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <View style={{ flex: 1, marginLeft: spacing.xs }}>
                <Text style={styles.rejectionTitle}>
                  {t('app.compliance.managerNote', 'Manager note')}
                </Text>
                <Text style={styles.rejectionBody}>{document.notes}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Current file */}
        <Text style={styles.sectionLabel}>
          {t('app.compliance.currentFile', 'Current File')}
        </Text>
        <View style={styles.card}>
          {document ? (
            <>
              <View style={styles.fileRow}>
                <Ionicons name="document-text" size={26} color={colors.primary} />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {document.fileName}
                  </Text>
                  <Text style={styles.fileMeta}>
                    {t('app.compliance.uploadedOn', 'Uploaded')} {formatDate(document.uploadedAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t('app.compliance.expiresAt', 'Expires')}
                </Text>
                <Text style={styles.detailValue}>
                  {hasExpiry ? formatDate(document.expiresAt) : t('app.compliance.doesNotExpire', "Doesn't expire")}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t('app.compliance.approval', 'Approval')}
                </Text>
                <Text style={styles.detailValue}>
                  {document.approvalStatus === 'approved'
                    ? `${t('app.compliance.approvedBy', 'Approved by')} ${document.approvedBy || '—'}`
                    : document.approvalStatus === 'rejected'
                    ? t('app.compliance.rejected', 'Rejected')
                    : t('app.compliance.awaitingReview', 'Awaiting manager review')}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.missingBox}>
              <Ionicons name="cloud-upload-outline" size={32} color={colors.gray[400]} />
              <Text style={styles.missingText}>
                {t('app.compliance.notUploaded', 'No file uploaded yet')}
              </Text>
            </View>
          )}
        </View>

        {/* Upload button */}
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={pickAndUpload}
          disabled={uploading}
          activeOpacity={0.85}
        >
          {uploading ? (
            <>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.uploadButtonText}>
                {t('app.compliance.uploading', 'Uploading...')}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color={colors.white} />
              <Text style={styles.uploadButtonText}>
                {isMissing
                  ? t('app.compliance.upload', 'Upload Document')
                  : t('app.compliance.uploadNew', 'Upload New Version')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* History */}
        <Text style={styles.sectionLabel}>
          {t('app.compliance.history', 'History')}
        </Text>
        <View style={styles.card}>
          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>
              {t('app.compliance.noHistory', 'No history yet.')}
            </Text>
          ) : (
            history.map((h, idx) => {
              const icon = HISTORY_ICON[h.event] || HISTORY_ICON.uploaded;
              return (
                <View key={h.id} style={styles.historyRow}>
                  <View style={[styles.historyIcon, { backgroundColor: icon.color + '15' }]}>
                    <Ionicons name={icon.icon} size={18} color={icon.color} />
                  </View>
                  <View style={styles.historyBody}>
                    <Text style={styles.historyTitle}>
                      {h.event === 'uploaded' && t('app.compliance.eventUploaded', 'Uploaded')}
                      {h.event === 'approved' && t('app.compliance.eventApproved', 'Approved')}
                      {h.event === 'rejected' && t('app.compliance.eventRejected', 'Rejected')}
                      {' · '}
                      <Text style={styles.historyActor}>{h.actor}</Text>
                    </Text>
                    <Text style={styles.historyTime}>{formatDateTime(h.timestamp)}</Text>
                    {h.notes ? <Text style={styles.historyNotes}>{h.notes}</Text> : null}
                  </View>
                  {idx < history.length - 1 ? <View style={styles.historyLine} /> : null}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.md,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
    statusCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderLeftWidth: 4,
      padding: spacing.md,
      ...shadows.sm,
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm + 2,
    },
    categoryLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: borderRadius.full,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    requiredBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.gray[300],
    },
    requiredText: {
      fontSize: 11,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    rejectionBox: {
      flexDirection: 'row',
      backgroundColor: '#FED7D7',
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
    rejectionTitle: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: '#7B341E',
      marginBottom: 2,
    },
    rejectionBody: {
      fontSize: typography.fontSize.sm,
      color: '#7B341E',
    },
    sectionLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    fileInfo: { flex: 1, marginLeft: spacing.sm + 2 },
    fileName: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textDark,
    },
    fileMeta: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.gray[100],
      marginVertical: spacing.sm,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    detailLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
    },
    detailValue: {
      fontSize: typography.fontSize.sm,
      color: colors.textDark,
      fontWeight: typography.fontWeight.medium,
      maxWidth: '60%',
      textAlign: 'right',
    },
    missingBox: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    missingText: {
      marginTop: spacing.sm,
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      marginTop: spacing.md,
      ...shadows.sm,
    },
    uploadButtonDisabled: {
      opacity: 0.7,
    },
    uploadButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
    },
    historyRow: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      position: 'relative',
    },
    historyIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm + 2,
    },
    historyLine: {
      position: 'absolute',
      left: 15,
      top: 40,
      bottom: 0,
      width: 2,
      backgroundColor: colors.gray[200],
    },
    historyBody: { flex: 1 },
    historyTitle: {
      fontSize: typography.fontSize.sm,
      color: colors.textDark,
      fontWeight: typography.fontWeight.medium,
    },
    historyActor: {
      fontWeight: typography.fontWeight.normal,
      color: colors.textLight,
    },
    historyTime: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      marginTop: 2,
    },
    historyNotes: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      marginTop: 4,
      fontStyle: 'italic',
    },
    emptyHistory: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
      textAlign: 'center',
      paddingVertical: spacing.md,
    },
  });
