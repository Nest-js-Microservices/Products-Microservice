import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDTO } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('BASE DE DATOS CONECTADA...');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;

    const totalItems = await this.product.count({ where: { available: true } });
    //retornar al usuario/cliente, el total de registros

    const lastPage = Math.ceil(totalItems / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      }),
      meta: {
        totalPages: totalItems, // registros de la DB
        page: page, //mostrar la pagina actual en la que se encuentra
        lastPage: lastPage,
      },

      /*

     "meta": {
        "totalPages": 49,
        "page": 1,
        "lastPage": 5
    }


    */
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });

    if (!product) {
      throw new RpcException(` Product with id: #${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    await this.findOne(id); //reutilizamos el metodo para ver si un id existe
    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id); //reutilizamos el metodo para ver si un id existe

    const product = await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    return product;
    /*return this.product.delete({
      where: {id}
    })
    */
  }
}
