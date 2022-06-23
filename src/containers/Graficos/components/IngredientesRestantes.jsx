import React, { useState, useEffect } from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell} from "recharts";
import Panel from "../../../shared/components/Panel";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";


const IngredientesRestantes = ({ cantidadIngredientes }) => {

  const [ingredientes] = useState([]);
  const [ingredientesOpciones] = useState([]);
  const { control } = useForm();
  const [filtrado , setFiltrado] = useState(false);
  const [ingredientesRestantes, setIngredientesRestantes] = useState([]);
  const [identificadores, setIdentificadores] = useState([]);

  // Convierte el arreglo de ingrdientes en un arreglo entendible para la librería recharts
  useEffect(() => {
    const realizarPeticiones = () => {
      for (const ingrediente of cantidadIngredientes) {
        ingredientesOpciones.push({ value: ingrediente.id, label: ingrediente.nombreIngrediente });
        ingredientes.push({ id: ingrediente.id, Nombre: ingrediente.nombreIngrediente, Unidades: ingrediente.cantidadReserva });
      }
    };
    realizarPeticiones();
  }, [cantidadIngredientes, ingredientes, ingredientesOpciones]);

  //  Crea un filtro para los ingredientes seleccionados por un array de identificadores
  const filtroIngredientes = (data) => {
    // Si existe un ingrediente seleccionado no mostrar el mensaje
    if (!data.length ) { setFiltrado(false); return; }
    setFiltrado(true);

    // Insertar en un arreglo los id de los ingredientes seleccionados
    setIdentificadores([]);
    for (const ingrediente of data) { identificadores.push(ingrediente.value); }
      setIngredientesRestantes(ingredientes.filter((ingrediente) => identificadores.includes(ingrediente.id)));
  }

  return (
    <Panel xl={12} lg={12} md={12} title={"Cantidad de unidades por ingrediente restantes en inventario"} 
      subhead={`Se muestran los respectivos ingredientes ordenados alfabéticamente`}>

      {/* Filtro por Ingrediente */}
      <div className="form__form-group">
        <div className="form__form-group-field">
        <Controller
            control={control}
            name="mes"
            render={({ field }) => (
              <Select
                isMulti
                className="react-select"
                onChange={(ingrediente) => filtroIngredientes(ingrediente)}
                options={ingredientesOpciones}
                value={field.value}
                placeholder="Seleccione los ingredientes por los que desea filtrar"
                classNamePrefix="react-select"
                isClearable={true}
              />
            )}
          />
        </div>
      </div>

      {/* Gráfico de barras */}
      {!filtrado && ingredientes.length !== 0 
        ? (<ResponsiveContainer height={260}>
            <BarChart data={ingredientes} margin={{ top: 20, left: -15 }}>
              <XAxis dataKey="Nombre" tickLine={false} hide={true} />
              <YAxis tickLine={false} />
              <Tooltip />
              <CartesianGrid vertical={false} />
              <Bar dataKey="Unidades" fill="#238484" barSize={50}>
                {ingredientes.map((ingrediente, index) => (
                  <Cell key={index} fill="#238484" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>) 
        : <p className="font-weight-bold mt-5">No hay información de ingredientes disponible.</p>}

      {/* Gráfico de barras filtrado */}
      {filtrado && ingredientesRestantes.length !== 0
        ? (<ResponsiveContainer height={260}>
            <BarChart data={ingredientesRestantes} margin={{ top: 20, left: -15 }}>
              <XAxis dataKey="Nombre" tickLine={false} hide={true} />
              <YAxis tickLine={false} />
              <Tooltip />
              <CartesianGrid vertical={false} />
              <Bar dataKey="Unidades" fill="#238484" barSize={50}>
                {ingredientesRestantes.map((ingrediente, index) => (
                  <Cell key={index} fill="#238484" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>)
        : null}

    </Panel>
  );
};

export default IngredientesRestantes;
