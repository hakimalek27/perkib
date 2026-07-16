import zon from "./zon";
import masjid from "./masjid";
import pegawai from "./pegawai";
import ajkEntry from "./ajkEntry";
import jenisSaguhati from "./jenisSaguhati";
import permohonanSaguhati from "./permohonanSaguhati";
import counter from "./counter";
import program from "./program";
import faq from "./faq";
import siteSettings from "./siteSettings";
import yuranTetapan from "./yuranTetapan";
import yuranTahunan from "./yuranTahunan";
import notifikasiTetapan from "./notifikasiTetapan";
import adminTetapan from "./adminTetapan";
import paparanUtama from "./paparanUtama";
import auditLog from "./auditLog";
import waOutbox from "./waOutbox";
import maklumBalas from "./maklumBalas";

export const schemaTypes = [
  permohonanSaguhati,
  pegawai,
  masjid,
  zon,
  ajkEntry,
  jenisSaguhati,
  yuranTahunan,
  yuranTetapan,
  notifikasiTetapan,
  adminTetapan,
  paparanUtama,
  program,
  faq,
  siteSettings,
  auditLog,
  waOutbox,
  maklumBalas,
  counter,
];
