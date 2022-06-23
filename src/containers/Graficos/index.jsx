import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import GananciasTrimestrales from "./components/GananciasTrimestrales";
import ClientesActivos from "./components/ClientesActivos";
import ProductoMasVendido from "./components/ProductoMasVendido";
import IngredientesRestantes from "./components/IngredientesRestantes";
import AumentoPrecioIngredientes from "./components/AumentoPrecioIngredientes";
import VentasMensuales from "./components/VentasMensuales";
import ProductosMasVendidos from "./components/ProductosMasVendidos";
import VentasTrimestrales from "./components/VentasTrimestrales";
import ProductosVendidosContraEntregados from "./components/PedidosActivosContraEntregados";
import ClientesPorCanton from "./components/ClientesPorCanton";
import Layout from "../Layout/index";
import Axios from "../../config/axios";
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";

const Graficos = () => {
  const [cantidadIngredientes, setCantidadIngredientes] = useState([]);
  const [aumentoPrecio, setAumentoPrecio] = useState([]);
  const [aumentoPrecioReporte, setAumentoPrecioReporte] = useState([]);
  const [ventasAgrupadas, setVentasAgrupadas] = useState([]);
  const [ventasNoAgrupadas, setVentasNoAgrupadas] = useState([]);
  const [clientesCanton, setClientesCanton] = useState([]);
  const [productoMasVendido, setProductoMasVendido] = useState([]);
  const [topCincoProductosVendidos, setTopCincoProductosVendidos] = useState([]);
  const [reporteIVASenasa, setReporteIVASenasa] = useState([]);
  const [pedidosActivosContraEntregados, setPedidosActivosContraEntregados] = useState([]);
  const [gananciasTrimestrales, setGananciasTrimestrales] = useState([]);
  const [clientesActivos, setClientesActivos] = useState([]);

  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const cantidadIngredientes = await Axios.get("/api/graficos/cantidad-ingredientes");
      const aumentoPrecio = await Axios.get("/api/graficos/aumento-precio-ingredientes");
      const topCincoProductosVendidos = await Axios.get("/api/graficos/top-cinco-productos-vendidos");
      const pedidosActivosContraEntregados = await Axios.get("/api/graficos/pedidos-entregados-activos");
      const ventas = await Axios.get("/api/graficos/ventas-mensuales-trimestrales");
      const clientesCanton = await Axios.get("/api/graficos/clientes-canton");
      const productoMasVendido = await Axios.get("/api/graficos/producto-mas-vendido");
      const gananciasTrimestrales = await Axios.get("/api/graficos/ganancias-trimestrales");
      const reporteIVASenasa = await Axios.get("/api/graficos/reporte-iva-senasa");
      const clientesActivos = await Axios.get("/api/graficos/clientes-activos");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setCantidadIngredientes(cantidadIngredientes.data.grafico);
        setAumentoPrecio(aumentoPrecio.data.aumentosIngredientes);
        setAumentoPrecioReporte(aumentoPrecio.data.aumentos);
        setTopCincoProductosVendidos(topCincoProductosVendidos.data.graficoTopCincoProductosVendidos);
        setPedidosActivosContraEntregados(pedidosActivosContraEntregados.data.graficoPedidosActivosContraEntregados);
        setVentasAgrupadas(ventas.data.graficoAgrupado);
        setVentasNoAgrupadas(ventas.data.graficoNoAgrupado);
        setClientesCanton(clientesCanton.data.ubicaciones);
        setClientesCanton(clientesCanton.data.ubicaciones);
        setProductoMasVendido(productoMasVendido.data.productoMasVendido);
        setGananciasTrimestrales(gananciasTrimestrales.data.data);
        setReporteIVASenasa(reporteIVASenasa.data.reporteImpuestos);
        setClientesActivos(clientesActivos.data.data);
      }
    })();
    return () => (isMounted = false); // Cancelar subscripciones asíncronas si el componente está inactivo
  }, []);

  const current = new Date();
  current.setMonth(current.getMonth());
  const mesActual = current.toLocaleString("es-MX", { month: "long" });
  const mesFormateado = mesActual[0].toUpperCase() + mesActual.slice(1);

  // Exportar reporte en formato excel
  const reporteExcel = React.useRef(null);
  const reporteIvaSenasa = () => {
    if (reporteExcel.current !== null) {
      reporteExcel.current.save();
    }
  };

  return (
    <div>
      <Layout />
      <div className="container__wrap">
        <Container className="dashboard">
          <Row>
            <Col md={6}>
              <h3 className="page-title">{"Gráficos Green Pet Food"}</h3>
            </Col>
            <Col md={6}>
              {/* Botón para descargar un reporte de impuestos */}
              <ExcelExport data={reporteIVASenasa} fileName={`Impuestos IVA y Senasa - ${mesFormateado}.xlsx`}ref={reporteExcel}>
                <ExcelExportColumn
                  field="montoIva"
                  title="Impuesto Iva"
                  locked={true}
                  width={200}
                />
                <ExcelExportColumn
                  field="montoSenasa"
                  title="Impuesto Senasa"
                  width={200}
                />
                <ExcelExportColumn
                  field="fechaImpuesto"
                  title="Fecha Pedido"
                  width={200}
                />
                <ExcelExportColumn
                  field="totalIva"
                  title="Total IVA"
                  width={200}
                />
                <ExcelExportColumn
                  field="totalSenasa"
                  title="Total Senasa"
                  width={200}
                />
              </ExcelExport>
              <button title="Reporte Impuestos IVA y Senasa Mensuales" className="btn btn-success btn-small float-right mt-1" 
                onClick={reporteIvaSenasa} disabled={!reporteIVASenasa.length}>
                Reporte Impuestos IVA y Senasa Mensuales
              </button>
            </Col>
          </Row>

          {/* Recuadros de ganancias trimestrales, clientes activos y producto más vendido del mes anterior */}
          <Row>
            <GananciasTrimestrales data={gananciasTrimestrales} />
            <ClientesActivos data={clientesActivos} />
            <ProductoMasVendido productoMasVendido={productoMasVendido} />
          </Row>

          {/* Gráficos de barras de productos más vendidos y productos vendidos contra entregados */}
          <Row>
            <ProductosMasVendidos
              topCincoProductosVendidos={topCincoProductosVendidos}
            />
            <ProductosVendidosContraEntregados
              pedidosActivosContraEntregados={pedidosActivosContraEntregados}
            />
          </Row>

          {/* Gráfico de barras de cantidad de ingredientes restantes en inventario */}
          <Row>
            <IngredientesRestantes
              cantidadIngredientes={cantidadIngredientes}
            />
          </Row>

          {/* Gráfico de barra de tiempo de aumento precio ingredientes */}
          <Row>
            <AumentoPrecioIngredientes
              aumentoPrecio={aumentoPrecio}
              aumentoPrecioReporte={aumentoPrecioReporte}
            />
          </Row>

          {/* Gráfico de ventas mensuales por producto */}
          <Row>
            <VentasMensuales
              ventasAgrupadas={ventasAgrupadas}
              ventasNoAgrupadas={ventasNoAgrupadas}
            />
          </Row>

          {/* Gráfico de ventas trimestrales por producto */}
          <Row>
            <VentasTrimestrales
              ventasAgrupadas={ventasAgrupadas}
              ventasNoAgrupadas={ventasNoAgrupadas}
            />
          </Row>

          {/* Gráfico de google maps para ubicar la cantidad de clientes por cantón */}
          <Row>
            <ClientesPorCanton clientesCanton={clientesCanton} />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Graficos;
