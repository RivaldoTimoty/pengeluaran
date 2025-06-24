import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime
import os

# --- KONFIGURASI HALAMAN ---
st.set_page_config(
    page_title="Dashboard Pengeluaran Pribadi",
    page_icon="💰",
    layout="wide"
)

# --- FUNGSI UNTUK MEMUAT DAN MENYIMPAN DATA ---
NAMA_FILE_DATA = "data_pengeluaran.csv"


def muat_data():
    """Memuat data pengeluaran dari file CSV. Jika file tidak ada, buat DataFrame kosong."""
    if os.path.exists(NAMA_FILE_DATA):
        try:
            # Baca CSV dan langsung konversi kolom Tanggal
            df = pd.read_csv(NAMA_FILE_DATA, parse_dates=['Tanggal'])
        except pd.errors.EmptyDataError:
            return pd.DataFrame(columns=["Tanggal", "Jumlah", "Kategori", "Deskripsi"])
    else:
        return pd.DataFrame(columns=["Tanggal", "Jumlah", "Kategori", "Deskripsi"])
    
    # Pastikan tipe data sudah benar setelah dibaca
    df['Tanggal'] = pd.to_datetime(df['Tanggal'])
    return df

def simpan_data(df):
    """Menyimpan DataFrame ke file CSV."""
    df.to_csv(NAMA_FILE_DATA, index=False)

# --- JUDUL APLIKASI ---
st.title("📊 Dashboard Pengeluaran Pribadi")
st.write("Aplikasi sederhana untuk melacak dan menganalisis pengeluaran Anda.")

# --- MEMUAT DATA ---
df = muat_data()

# --- SIDEBAR UNTUK INPUT DATA ---
st.sidebar.header("➕ Tambah Pengeluaran Baru")

with st.sidebar.form("form_pengeluaran", clear_on_submit=True):
    tanggal = st.date_input("Tanggal", datetime.now())
    jumlah = st.number_input("Jumlah (Rp)", min_value=0.0, format="%.2f")
    kategori = st.selectbox("Kategori",
                            ["Makanan & Minuman", "Transportasi", "Belanja", "Hiburan", "Tagihan", "Kesehatan", "Pendidikan", "Lainnya"])
    deskripsi = st.text_area("Deskripsi (Opsional)")

    tombol_submit = st.form_submit_button("Tambah Pengeluaran")

    if tombol_submit:
        if jumlah > 0:
            data_baru = pd.DataFrame([{
                "Tanggal": pd.to_datetime(tanggal), # Pastikan format datetime saat menambah
                "Jumlah": jumlah,
                "Kategori": kategori,
                "Deskripsi": deskripsi
            }])
            df = pd.concat([df, data_baru], ignore_index=True)
            simpan_data(df)
            st.sidebar.success("Pengeluaran berhasil ditambahkan!")
            st.rerun()
        else:
            st.sidebar.error("Jumlah harus lebih besar dari nol.")

# --- PERBAIKAN DIMULAI DI SINI ---
# Cek apakah DataFrame memiliki data sebelum melakukan analisis
if not df.empty:
    st.header("🔍 Filter & Analisis")
    df['TahunBulan'] = df['Tanggal'].dt.to_period('M').astype(str)
    
    # Ambil daftar bulan unik dan urutkan dari yang terbaru
    daftar_bulan = sorted(df['TahunBulan'].unique(), reverse=True)
    bulan_terpilih = st.selectbox("Pilih Bulan untuk Analisis:", options=daftar_bulan)

    # Filter DataFrame berdasarkan bulan yang dipilih
    df_filtered = df[df['TahunBulan'] == bulan_terpilih].copy()

    # --- RINGKASAN PENGELUARAN (BERDASARKAN BULAN TERPILIH) ---
    if not df_filtered.empty:
        total_pengeluaran_bulan = df_filtered['Jumlah'].sum()
        rata_rata_harian = df_filtered.groupby(df_filtered['Tanggal'].dt.date)['Jumlah'].sum().mean()
        kategori_teratas = df_filtered.groupby('Kategori')['Jumlah'].sum().idxmax()
        jumlah_kategori_teratas = df_filtered.groupby('Kategori')['Jumlah'].sum().max()

        st.subheader(f"Ringkasan untuk Bulan {bulan_terpilih}")
        col1, col2, col3 = st.columns(3)
        col1.metric("Total Pengeluaran", f"Rp {total_pengeluaran_bulan:,.2f}")
        col2.metric("Rata-rata Harian", f"Rp {rata_rata_harian:,.2f}")
        col3.metric(f"Kategori Teratas: {kategori_teratas}", f"Rp {jumlah_kategori_teratas:,.2f}")
    
    # --- VISUALISASI DATA ---
    st.markdown("---")
    if not df_filtered.empty:
        col_viz1, col_viz2 = st.columns(2)

        with col_viz1:
            st.subheader("Distribusi Pengeluaran per Kategori")
            fig_pie = px.pie(df_filtered,
                             names='Kategori',
                             values='Jumlah',
                             hole=0.3,
                             title=f"Persentase Kategori di Bulan {bulan_terpilih}")
            fig_pie.update_traces(textposition='inside', textinfo='percent+label')
            st.plotly_chart(fig_pie, use_container_width=True)

        with col_viz2:
            st.subheader("Tren Pengeluaran Harian")
            tren_harian = df_filtered.groupby(df_filtered['Tanggal'].dt.date)['Jumlah'].sum().reset_index()
            tren_harian = tren_harian.rename(columns={'Tanggal': 'Tanggal', 'Jumlah': 'Total Harian'})
            
            fig_line = px.line(tren_harian,
                               x='Tanggal',
                               y='Total Harian',
                               markers=True,
                               title=f"Tren Pengeluaran Harian di Bulan {bulan_terpilih}")
            fig_line.update_layout(xaxis_title='Tanggal', yaxis_title='Total Pengeluaran (Rp)')
            st.plotly_chart(fig_line, use_container_width=True)

    # --- MENAMPILKAN DATA MENTAH DENGAN FITUR HAPUS ---
    st.markdown("---")
    st.subheader("📖 Semua Data Pengeluaran")
    
    # Buat DataFrame dengan indeks untuk memudahkan penghapusan
    df_display = df.copy()
    df_display.insert(0, 'ID', range(1, 1 + len(df_display))) # Tambahkan kolom ID
    
    st.dataframe(df_display.sort_values(by="Tanggal", ascending=False), use_container_width=True, hide_index=True)

    # Form untuk menghapus data
    st.markdown("---")
    st.subheader("🗑️ Hapus Data Pengeluaran")
    with st.form("form_hapus_pengeluaran"):
        id_untuk_hapus = st.number_input("Masukkan ID Pengeluaran yang ingin dihapus:", min_value=1, max_value=len(df_display), value=1)
        tombol_hapus = st.form_submit_button("Hapus Pengeluaran")

        if tombol_hapus:
            if id_untuk_hapus > 0 and id_untuk_hapus <= len(df_display):
                # Dapatkan indeks asli dari baris yang akan dihapus berdasarkan ID yang ditampilkan
                # Karena kita menambahkan 'ID' dari 1, kita perlu menguranginya untuk mendapatkan indeks berbasis 0
                indeks_untuk_hapus = id_untuk_hapus - 1
                
                # Gunakan iloc untuk menghapus baris berdasarkan posisi integer
                df = df.drop(df.index[indeks_untuk_hapus]).reset_index(drop=True)
                simpan_data(df)
                st.success(f"Pengeluaran dengan ID {id_untuk_hapus} berhasil dihapus!")
                st.rerun()
            else:
                st.error("ID tidak valid. Mohon masukkan ID yang benar.")


    # Menambahkan tombol untuk download data
    csv = df.to_csv(index=False).encode('utf-8')
    st.download_button(
       "⬇️ Unduh Data sebagai CSV",
       csv,
       "laporan_pengeluaran.csv",
       "text/csv",
       key='download-csv'
    )
else:
    # Tampilkan pesan ini jika tidak ada data sama sekali
    st.info("👋 Selamat datang! Belum ada data pengeluaran. Silakan tambahkan pengeluaran baru melalui form di sidebar kiri untuk memulai.")
