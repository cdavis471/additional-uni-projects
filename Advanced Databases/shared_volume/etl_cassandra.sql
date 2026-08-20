-- ETL Processing

-- 1: Pricing By Week 
-- Partitioning by merchant & Clustering by week_start
-- ---------------------------------------------------
COPY (
	SELECT  dp.merchant, -- Merchant Partitioning
			date_trunc('week', d.date_actual)::date AS week_start, -- Week Time Grain
			SUM(fp.line_revenue)::float8 AS revenue_gained, -- Total Revenue By Line
			SUM(fp.quantity * fp.discount)::float8 AS revenue_lost, -- Total Revenue Lost By Discount
			COALESCE('{' || string_agg(DISTINCT quote_literal(fp.extra_info->>'coupon'), ',') FILTER (WHERE (fp.extra_info->>'coupon') IS NOT NULL AND (fp.extra_info->>'coupon') <> '') || '}', '{}') AS coupons_used  --Coupons Used
	FROM c20441826_phaseii_dw.fact_pricing fp -- Source Table
	JOIN c20441826_phaseii_dw.dim_date d USING(date_key) -- Join Date Dimensional Table
	JOIN c20441826_phaseii_dw.dim_product dp USING(product_key) -- Join Product Dimensional Table
	GROUP BY 1,2 -- Aggregate by merchant and week_start
) TO '/etl/c20441826_pricing_by_week.csv' WITH CSV HEADER;

-- 2: Category Price By Day
-- Partitioning by category & Clustering by date_actual & merchant
-- ---------------------------------------------------------------
COPY (
	SELECT  dp.category, -- Category Partitioning
			d.date_actual AS date_actual, -- Day Time Grain
			dp.merchant, -- For Merchant Comparisons
			AVG(fp.unit_price)::float8 AS avg_unit_price, -- Average Unit Price
			AVG(fp.discount)::float8 AS avg_discount, -- Average Discount
			AVG(fp.price_delta)::float8 AS avg_price_delta, -- Average Price Delta
			COALESCE('{' || string_agg(DISTINCT quote_literal(fp.extra_info->>'coupon'), ',') FILTER (WHERE (fp.extra_info->>'coupon') IS NOT NULL AND (fp.extra_info->>'coupon') <> '') || '}', '{}') AS coupons_used  --Coupons Used
	FROM c20441826_phaseii_dw.fact_pricing fp -- Source Table
	JOIN c20441826_phaseii_dw.dim_date d USING(date_key) -- Join Date Dimensional Table
	JOIN c20441826_phaseii_dw.dim_product dp USING(product_key) -- Join Product Dimensional Table
	GROUP BY 1,2,3 -- Aggregate by category, date_actual, and merchant
) TO '/etl/c20441826_category_price_by_day.csv' WITH CSV HEADER;

-- 3: Category Sales By Week
-- Partitioning by week_start & Clustering by category & merchant
-- --------------------------------------------------------------
COPY (
	SELECT  date_trunc('week', d.date_actual)::date AS week_start, -- Weekly Partitioning
			dp.category, -- Clustering By Category
			dp.merchant, -- Clustering By Merchant
			SUM(fp.line_revenue)::float8 AS revenue_gained, -- Total Revenue By Line
			SUM(fp.quantity * fp.discount)::float8 AS revenue_lost -- Total Revenue Lost By Discount
	FROM c20441826_phaseii_dw.fact_pricing fp -- Source Table
	JOIN c20441826_phaseii_dw.dim_date d USING(date_key) -- Join Date Dimensional Table
	JOIN c20441826_phaseii_dw.dim_product dp USING(product_key) -- Join Product Dimensional Table
	GROUP BY 1,2,3 -- Aggregate by week_start, category, and merchant
) TO '/etl/c20441826_category_sales_by_week.csv' WITH CSV HEADER;
