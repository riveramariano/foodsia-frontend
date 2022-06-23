import React, { Fragment, useLayoutEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Col, Card, Row } from "reactstrap";
import DatePicker from "react-datepicker";
import es from "date-fns/locale/es";

const EditarMascota = ({ setCached,  nuevosCambios, register, readonly, mascotas, control,errors }) => {

  let { fields, append, remove } = useFieldArray({ control, name: "mascotas", keyName: "mascotaId" });
  let cumpleannos = [];

  const agregarMascota = () => {
    setCached(true);
    append({ mascotaId: fields.length.toString() });
    mascotas.push({
      mascotaId: null,
      nombreMascota: "",
      fechaNacimiento: "",
      padecimientos: "",
      clienteId: 1,
    });
  };

  const eliminarMascota = (index) => {
    setCached(true);
    remove(index);
  };

  useLayoutEffect(() => {
    for (const mascota of mascotas) {
      append({ mascotaId: mascota.mascotaId });
    }
  }, [append, mascotas]);

  if (mascotas.length > 0) {
    for (const mascota of mascotas) {
      const fechaFormateada = mascota.fechaNacimiento.replace(
        /(\d+[/])(\d+[/])/,
        "$2$1"
      );
      cumpleannos.push(new Date(fechaFormateada));
    }
  }

  // Este condional sirve para pre-popular inputs vacíos en caso de "Agregar"
  if (mascotas.length === 0) {
    mascotas.push({
      mascotaId: null,
      nombreMascota: "",
      fechaNacimiento: "",
      padecimientos: "",
      clienteId: 1,
    });
  }

  return (
    <Fragment>
      <Card>
        <h4 className="text-center">Información Mascotas {readonly ? ("") : 
          (
            <button
              title="Agregar Mascota"
              className="lnr lnr-plus-circle modal__add-btn ml-2"
              type="button"
              onClick={() => agregarMascota()}
            />
          )}
        </h4>
        <hr />

        {fields.map((item, index) => (
          <Fragment key={index}>
            <Row>

              {/* Columna izquierda */}
              <Col md={6}>

                {/* Nombre mascota */}
                <div className="form__form-group">
                  <span className="form__form-group-label">Nombre</span>
                  <div className="form__form-group-field">
                    {readonly ? (
                      <span className="text-secondary">
                        {mascotas[index].nombreMascota}
                      </span>
                    ) : (
                      <div className="form__form-group-input-wrap">
                        <input
                          type="text"
                          placeholder="Nombre"
                          name={`mascotas.${index}.nombreMascota`}
                          defaultValue={mascotas[index].nombreMascota}
                          className={`${errors.mascotas?.[index]?.nombreMascota ? "danger" : ""}`}
                          {...register(`mascotas.${index}.nombreMascota`, {
                            required: true,
                            onChange: nuevosCambios,
                          })}
                        />
                        {errors.mascotas?.[index]?.nombreMascota?.message && (
                          <span className="form__form-group-error">
                            {errors.mascotas?.[index]?.nombreMascota?.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              {/* Columna derecha */}
              <Col md={6}>

                {/* Fecha de nacimiento */}
                <div className="form__form-group">
                  <span className="form__form-group-label">Fecha Nacimiento</span>
                  <div className="form__form-group-field">
                    {readonly ? (
                      <span className="text-secondary">
                        {mascotas[index].fechaNacimiento}
                      </span>
                    ) : (
                      <div className="form__form-group-input-wrap">
                        <div className="date-picker">
                          <Controller
                            control={control}
                            name={`mascotas.${index}.fechaNacimiento`}
                            defaultValue={mascotas[index].fechaNacimiento ? cumpleannos[index] : ""}
                            render={({ field }) => (
                              <DatePicker
                                placeholderText="Nacimiento"
                                className={`${errors.mascotas?.[index]?.fechaNacimiento ? "danger" : ""}`}
                                selected={field.value}
                                onChange={(fecha) => field.onChange(fecha)}
                                onKeyDown={nuevosCambios}
                                onChangeRaw={nuevosCambios}
                                dateFormat="dd-MM-yyyy"
                                isClearable
                                locale={es}
                              />
                            )}
                          />
                        </div>
                        {errors.mascotas?.[index]?.fechaNacimiento?.message && (
                          <span className="form__form-group-error">
                            {errors.mascotas?.[index]?.fechaNacimiento?.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Col>

            </Row>
          
            {/* Lado de abajo */}
            <Row>
              <Col md={12}>

                {/* Padecimientos mascota */}
                <div className="form__form-group">
                  <span className="form__form-group-label">Padecimientos</span>
                  <div className="form__form-group-field">
                    {readonly ? (
                      <span className="text-secondary">
                        {mascotas[index].padecimientos}
                      </span>
                    ) : (
                      <textarea
                        type="text"
                        placeholder="Lista de padecimientos de la mascota"
                        defaultValue={mascotas[index].padecimientos}
                        {...register(`mascotas.${index}.padecimientos`, {
                          required: false,
                          onChange: nuevosCambios,
                        })}
                      />
                    )}
                  </div>
                </div>
              </Col>

              {fields.length > 1 && !readonly ? (
                <Col md={12}>
                  <h5 className="delete-pet text-right">
                    <div onClick={() => eliminarMascota(index)}>
                      <span className="lnr lnr-circle-minus mr-2"></span>Eliminar Mascota
                    </div>
                  </h5>
                </Col>
              ) : (
                ""
              )}
            </Row>
            {fields.length > 1 && (fields[fields.length - 1] !==  fields[index]) ? <hr /> : ""}
          </Fragment>
        ))}
      </Card>
    </Fragment>
  );
};

export default EditarMascota;
