package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type Product struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Price        string `json:"price"`
	Manufacturer string `json:"manufacturer"`
}

type ProductContract struct {
	contractapi.Contract
}

// GetAllProducts retrieves all products from the world state.
func (p *ProductContract) GetAllProducts(ctx contractapi.TransactionContextInterface) ([]*Product, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	defer resultsIterator.Close()

	var products []*Product
	for resultsIterator.HasNext() {
		item, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var product Product
		if err := json.Unmarshal(item.Value, &product); err != nil {
			return nil, err
		}
		products = append(products, &product)
	}

	return products, nil
}

// CreateProduct adds a new product to the world state with the given details.
func (p *ProductContract) CreateProduct(ctx contractapi.TransactionContextInterface, id string, name string, description string, price string) error {
	manufacturerID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client identity: %v", err)
	}

	product := Product{
		ID:           id,
		Name:         name,
		Description:  description,
		Price:        price,
		Manufacturer: manufacturerID,
	}

	productJSON, err := json.Marshal(product)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(id, productJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state. %v", err)
	}

	return nil
}

// ReadProduct retrieves the product from the world state with the given ID.
func (p *ProductContract) ReadProduct(ctx contractapi.TransactionContextInterface, id string) (*Product, error) {
	productJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if productJSON == nil {
		return nil, fmt.Errorf("the product %s does not exist", id)
	}

	var product Product
	err = json.Unmarshal(productJSON, &product)
	if err != nil {
		return nil, err
	}

	return &product, nil
}

// UpdateProduct updates an existing product in the world state with the provided parameters.
func (p *ProductContract) UpdateProduct(ctx contractapi.TransactionContextInterface, id string, name string, description string, price string) error {
	productJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if productJSON == nil {
		return fmt.Errorf("the product %s does not exist", id)
	}

	var product Product
	err = json.Unmarshal(productJSON, &product)
	if err != nil {
		return err
	}

	product.Name = name
	product.Description = description
	product.Price = price

	productJSON, err = json.Marshal(product)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(id, productJSON)
	if err != nil {
		return fmt.Errorf("failed to update product in world state: %v", err)
	}

	return nil
}

// DeleteProduct removes a product from the world state with the given ID.
func (p *ProductContract) DeleteProduct(ctx contractapi.TransactionContextInterface, id string) error {
	productJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if productJSON == nil {
		return fmt.Errorf("the product %s does not exist", id)
	}

	err = ctx.GetStub().DelState(id)
	if err != nil {
		return fmt.Errorf("failed to delete product from world state: %v", err)
	}

	return nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(ProductContract))
	if err != nil {
		fmt.Printf("Error create product chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting product chaincode: %s", err.Error())
	}
}
