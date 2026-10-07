package com.priyamart.backend;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class CsvProductImporter implements CommandLineRunner {

    private final ProductRepository productRepository;

    public CsvProductImporter(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        // Existing catalog already 200+ na import panna vendam
        if (productRepository.count() >= 200) {
            System.out.println("PriyaMart catalog already contains 200+ products.");
            return;
        }

        ClassPathResource resource =
                new ClassPathResource("products.csv");

        try (InputStream inputStream = resource.getInputStream();
             BufferedReader reader = new BufferedReader(
                     new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

            String line;
            boolean firstLine = true;
            int added = 0;

            while ((line = reader.readLine()) != null) {

                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] data = line.split(",", -1);

                if (data.length < 10) {
                    System.out.println("Skipping invalid product: " + line);
                    continue;
                }

                Product product = new Product();

                product.setName(data[0].trim());
                product.setBrand(data[1].trim());
                product.setCategory(data[2].trim());
                product.setPrice(Double.parseDouble(data[3].trim()));
                product.setOriginalPrice(Double.parseDouble(data[4].trim()));
                product.setDiscount(Integer.parseInt(data[5].trim()));
                product.setUnit(data[6].trim());
                product.setStock(Integer.parseInt(data[7].trim()));
                product.setDescription(data[8].trim());
                product.setImage(data[9].trim());

                productRepository.save(product);

                added++;
            }

            System.out.println(
                added + " products imported successfully into PriyaMart!"
            );
        }
    }
}