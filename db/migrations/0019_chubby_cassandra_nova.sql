CREATE UNIQUE INDEX "payment_methods_provider_owner_index" ON "payment_methods" USING btree ("provider","owner");