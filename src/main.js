import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// ── Utilidad de pruebas (solo desarrollo) ─────────────────────
if (import.meta.env.DEV) {
  import('./stores/useAfiliadoStore').then(({ useAfiliadoStore }) => {
    const benBase = (parentesco, edad, tipo = 'DE_LEY') => ({
      tipoBeneficiario: tipo,
      parentesco,
      genero: 'F',
      tipoDocumento: 'CC',
      numeroDocumento: String(Math.floor(10000000 + Math.random() * 90000000)),
      primerApellido: 'TEST',
      segundoApellido: '',
      primerNombre: parentesco.split(' ')[0],
      segundoNombre: '',
      fechaNacimiento: new Date(new Date().getFullYear() - edad, 0, 1).toISOString().split('T')[0],
      edad,
      estado: 'INGRESO',
      valorPorPersona: null
    })

    window.$test = {
      // Configurar el afiliado base para cada escenario
      setBasico(estadoCivil = 'SOLTERO') {
        const store = useAfiliadoStore()
        Object.assign(store.afiliado, {
          canal: 'INDIVIDUAL', producto: 'INTEGRAL', grupo: 'BASICO',
          estadoCivil, tipoDocumento: 'CC', numeroDocumento: '12345678',
          primerApellido: 'PRUEBA', primerNombre: 'TEST',
          fechaNacimiento: '1990-01-01', edad: 35, sexo: 'M', celular: '3001234567'
        })
        store.beneficiarios.length = 0
        console.log(`%c✓ Afiliado BASICO listo (estadoCivil: ${estadoCivil})`, 'color:green')
      },
      setUnifamiliar(novedad = '') {
        const store = useAfiliadoStore()
        Object.assign(store.afiliado, {
          canal: 'INDIVIDUAL', producto: 'INTEGRAL', grupo: 'UNIFAMILIAR',
          novedad, estadoCivil: 'CASADO',
          tipoDocumento: 'CC', numeroDocumento: '12345678',
          primerApellido: 'PRUEBA', primerNombre: 'TEST',
          fechaNacimiento: '1990-01-01', edad: 35, sexo: 'M', celular: '3001234567'
        })
        store.beneficiarios.length = 0
        console.log(`%c✓ Afiliado UNIFAMILIAR listo (novedad: '${novedad}')`, 'color:green')
      },

      // Agregar beneficiarios de prueba al store directamente
      addBen: (parentesco, edad, tipo = 'DE_LEY') => {
        const store = useAfiliadoStore()
        store.beneficiarios.push(benBase(parentesco, edad, tipo))
        console.log(`%c+ Beneficiario agregado: ${parentesco} (${edad} años, ${tipo})`, 'color:blue')
      },

      clear: () => { useAfiliadoStore().beneficiarios.length = 0; console.log('Beneficiarios limpiados') },
      list:  () => console.table(useAfiliadoStore().beneficiarios.map(b => ({ parentesco: b.parentesco, edad: b.edad, tipo: b.tipoBeneficiario }))),

      // Escenarios predefinidos
      escenarios: {
        '1_hijo_30':       () => { window.$test.setBasico('CASADO');   window.$test.addBen('HIJO (A)', 30) },
        '2_hijo_31_error': () => { window.$test.setBasico('CASADO');   window.$test.addBen('HIJO (A)', 31) },
        '3_hijo_luego_hermano_error': () => {
          window.$test.setBasico('SOLTERO')
          window.$test.addBen('HIJO (A)', 25)
          console.log('%cAhora intenta agregar un HERMANO desde el formulario → debe dar error', 'color:orange')
        },
        '4_hermano_luego_hijo_error': () => {
          window.$test.setBasico('SOLTERO')
          window.$test.addBen('HERMANO (A)', 25)
          console.log('%cAhora intenta agregar un HIJO desde el formulario → debe dar error', 'color:orange')
        },
        '5_casado_hermano_error': () => {
          window.$test.setBasico('CASADO')
          console.log('%cAhora intenta agregar un HERMANO desde el formulario → debe dar error (casado)', 'color:orange')
        },
        '6_soltero_suegro_error': () => {
          window.$test.setBasico('SOLTERO')
          console.log('%cAhora intenta agregar un SUEGRO desde el formulario → debe dar error (soltero)', 'color:orange')
        },
        '7_padre_madre_suegro_error': () => {
          window.$test.setBasico('CASADO')
          window.$test.addBen('PADRE', 60)
          window.$test.addBen('MADRE', 58)
          console.log('%cAhora intenta agregar un SUEGRO → debe dar error (tiene padre Y madre)', 'color:orange')
        },
        '8_solo_padre_suegro_ok': () => {
          window.$test.setBasico('CASADO')
          window.$test.addBen('PADRE', 60)
          console.log('%cAhora intenta agregar un SUEGRO → debe permitirlo (solo padre, sin madre)', 'color:green')
        },
        '9_unifamiliar_limite_6': () => {
          window.$test.setUnifamiliar()
          for (let i = 0; i < 6; i++) window.$test.addBen('HIJO (A)', 10 + i)
          console.log('%cAhora intenta agregar un 7mo beneficiario DE_LEY → debe dar error', 'color:orange')
        },
        '10_unifamiliar_traslado_limite_10': () => {
          window.$test.setUnifamiliar('TRASLADO_COMPETENCIA')
          for (let i = 0; i < 10; i++) window.$test.addBen('HIJO (A)', 10 + i)
          console.log('%cAhora intenta agregar un 11mo beneficiario DE_LEY → debe dar error', 'color:orange')
        },
        '11_unifamiliar_mayores_60': () => {
          window.$test.setUnifamiliar()
          window.$test.addBen('PADRE', 65)
          window.$test.addBen('MADRE', 63)
          console.log('%cAhora intenta agregar un 3er beneficiario mayor de 60 → debe dar error', 'color:orange')
        }
      },

      ayuda() {
        console.log('%c=== $test — Comandos disponibles ===', 'font-weight:bold;color:#6366f1')
        console.log('$test.setBasico("SOLTERO"|"CASADO"|"SEPARADO"|"UNION_LIBRE")')
        console.log('$test.setUnifamiliar(""|"TRASLADO_COMPETENCIA")')
        console.log('$test.addBen("HIJO (A)", 25)   ← parentesco, edad')
        console.log('$test.clear()   $test.list()')
        console.log('%cEscenarios predefinidos:', 'font-weight:bold')
        Object.keys(window.$test.escenarios).forEach(k => console.log(`  $test.escenarios.${k}()`))
      }
    }

    console.log('%c🧪 $test disponible — escribe $test.ayuda() para ver los comandos', 'color:#6366f1;font-weight:bold')
  })
}
