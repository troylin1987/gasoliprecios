export const API_URL =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

export const DEV_API_PATH = '/api/precios-carburantes/estaciones-terrestres';
export const STATIC_DATA_PATH = `${import.meta.env.BASE_URL}sampledata.json`;
export const CACHE_KEY = 'gasoliprecios:fuel-data:v1';
export const CACHE_TTL_MS = 30 * 60 * 1000;

export const CCAA_NAMES = {
  '01': 'Andalucia',
  '02': 'Aragon',
  '03': 'Asturias',
  '04': 'Illes Balears',
  '05': 'Canarias',
  '06': 'Cantabria',
  '07': 'Castilla-La Mancha',
  '08': 'Castilla y Leon',
  '09': 'Cataluna',
  10: 'Comunitat Valenciana',
  11: 'Extremadura',
  12: 'Galicia',
  13: 'Comunidad de Madrid',
  14: 'Region de Murcia',
  15: 'Comunidad Foral de Navarra',
  16: 'Pais Vasco',
  17: 'La Rioja',
  18: 'Ceuta',
  19: 'Melilla',
};

export const FUEL_FIELDS = [
  'Precio Gasoleo A',
  'Precio Gasolina 95 E5',
  'Precio Gasoleo Premium',
  'Precio Gasolina 98 E5',
  'Precio Gasoleo B',
  'Precio Adblue',
  'Precio Gases licuados del petróleo',
  'Precio Gas Natural Comprimido',
  'Precio Gas Natural Licuado',
  'Precio Diésel Renovable',
  'Precio Gasolina 95 E10',
  'Precio Gasolina 95 E5 Premium',
  'Precio Gasolina 98 E10',
  'Precio Biodiesel',
  'Precio Gasolina Renovable',
  'Precio Biogas Natural Comprimido',
  'Precio Biogas Natural Licuado',
  'Precio Gasolina 95 E85',
  'Precio Bioetanol',
  'Precio Gasolina 95 E25',
  'Precio Hidrogeno',
  'Precio Amoniaco',
  'Precio Metanol',
];

export const FUEL_LABELS = {
  'Precio Gasoleo A': 'Diesel A',
  'Precio Gasolina 95 E5': 'Gasolina 95',
  'Precio Gasoleo Premium': 'Diesel Premium',
  'Precio Gasolina 98 E5': 'Gasolina 98',
  'Precio Gasoleo B': 'Gasoleo B',
  'Precio Adblue': 'AdBlue',
  'Precio Gases licuados del petróleo': 'GLP',
  'Precio Gas Natural Comprimido': 'GNC',
  'Precio Gas Natural Licuado': 'GNL',
  'Precio Diésel Renovable': 'Diesel renovable',
  'Precio Gasolina 95 E10': 'Gasolina 95 E10',
  'Precio Gasolina 95 E5 Premium': 'Gasolina 95 Premium',
  'Precio Gasolina 98 E10': 'Gasolina 98 E10',
  'Precio Biodiesel': 'Biodiesel',
  'Precio Gasolina Renovable': 'Gasolina renovable',
  'Precio Biogas Natural Comprimido': 'BioGNC',
  'Precio Biogas Natural Licuado': 'BioGNL',
  'Precio Gasolina 95 E85': 'Gasolina E85',
  'Precio Bioetanol': 'Bioetanol',
  'Precio Gasolina 95 E25': 'Gasolina E25',
  'Precio Hidrogeno': 'Hidrogeno',
  'Precio Amoniaco': 'Amoniaco',
  'Precio Metanol': 'Metanol',
};
