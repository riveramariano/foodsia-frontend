import React, { Fragment, useLayoutEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Col, Card, Row } from "reactstrap";
import Select from "react-select";
import Swal from "sweetalert2";

const EditarDetallePedido = ({ setCached, nuevosCambios, register, readonly, productos, detallesPedido, control ,errors }) => {

  let { fields, append, remove } = useFieldArray({ control, name: "detallesPedido", keyName: "detallePedidoId" });

  const agregarDetallePedido = () => {
    if (fields && fields.length > 3) {
      Swal.fire({
        icon: "error",
        title: "Error Detalle Pedido",
        text: "No se puede agregar más de 4 productos a comprar.",
        showCancelButton: false,
        confirmButtonColor: "#238484",
        confirmButtonText: "Confirmar",
      });
      return;
    }
    setCached(true);
    append({ detallePedidoId: fields.length.toString() });
    detallesPedido.push({
      mascotaId: null,
      producto: null,
      cantidad: null,
    });
  };

  const eliminarDetallePedido = (index) => {
    setCached(true);
    remove(index);
  };

  useLayoutEffect(() => {
    for (const detallePedido of detallesPedido) {
      append({ detallePedidoId: detallePedido.detallePedidoId });
    }
  }, [append, detallesPedido]);

  // Este condional sirve para pre-popular inputs vacíos en caso de "Agregar"
  if (detallesPedido.length === 0) {
    detallesPedido.push({
      detallePedidoId: null,
      producto: null,
      cantidad: null,
    });
  }

  const blockInvalidChar = e =>
    !['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Ctrl', 'a', 'z', 'x', 'c', 'A', 'Z', 'X', 'C', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
    .includes(e.key) && e.preventDefault();

  return (
    <Fragment>
      <Card>
        <h4 className="text-center">Detalles Pedido {readonly ? ("") : 
          (
            <button
              title="Agregar Producto"
              className="lnr lnr-plus-circle modal__add-btn ml-2"
              type="button"
              onClick={() => agregarDetallePedido()}
            />
          )}
        </h4>
        <hr />

        {fields.map((item, index) => (
          <Fragment key={index}>

            {/* Fila superior */}
            <Row>
              <Col md={12}>

                {/* Producto */}
                <div className="form__form-group">
                  <span className="form__form-group-label">Producto</span>
                  <div className="form__form-group-field">
                    {readonly ? (
                      <span className="text-secondary">
                        {detallesPedido[index].nombreProducto}
                      </span>
                    ) : (
                      <div className="form__form-group-input-wrap">
                        <Controller
                          control={control}
                          name={`detallesPedido.${index}.producto`}
                          defaultValue={detallesPedido[0].nombreProducto 
                            ? {
                              value: detallesPedido[index].productoId,
                              label: detallesPedido[index].nombreProducto,
                            } 
                            : null}
                          render={({ field }) => (
                            <Select
                              className="react-select"
                              onInputChange={nuevosCambios}
                              onChange={(producto) => field.onChange(producto)}
                              options={productos}
                              value={field.value}
                              placeholder="Producto a comprar"
                              classNamePrefix="react-select"
                              isClearable={true}
                            />
                          )}
                        />
                        {errors.detallesPedido?.[index]?.producto?.message && (
                          <span className="form__form-group-error">
                            {errors.detallesPedido?.[index]?.producto?.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            
            {/* Fila inferior */}
            <Row>
              <Col md={8}>

                {/* Cantidad producto */}
                <div className="form__form-group">
                  <span className="form__form-group-label">Cantidad</span>
                  <div className="form__form-group-field">
                    {readonly ? (
                      <span className="text-secondary">
                        {detallesPedido[index].cantidad} unidades
                      </span>
                    ) : (
                      <div className="form__form-group-input-wrap">
                        <input
                          type="number"
                          placeholder="Cantidad a comprar"
                          name={`detallesPedido.${index}.cantidad`}
                          defaultValue={detallesPedido[index].cantidad}
                          className={`${errors.detallesPedido?.[index]?.cantidad ? "danger" : ""}`}
                          {...register(`detallesPedido.${index}.cantidad`, {
                            required: true,
                            onChange: nuevosCambios,
                          })}
                          onKeyDown={blockInvalidChar}
                        />
                        {errors.detallesPedido?.[index]?.cantidad?.message && (
                          <span className="form__form-group-error">
                            {errors.detallesPedido?.[index]?.cantidad?.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado del pedido */}
                {readonly ? (
                  <div className="form__form-group">
                    <span className="form__form-group-label">Monto Producto</span>
                    <div className="form__form-group-field">
                      <span className="text-secondary">
                        ₡ {detallesPedido[index].monto}
                      </span>
                    </div>
                  </div>
                ) : null}

              </Col>

              {fields.length > 1 && !readonly ? (
                <Col md={4}>
                  <h5 className="delete-pet text-right">
                    <div onClick={() => eliminarDetallePedido(index)}>
                      <span className="lnr lnr-circle-minus mr-2"></span>Eliminar producto
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

export default EditarDetallePedido;
