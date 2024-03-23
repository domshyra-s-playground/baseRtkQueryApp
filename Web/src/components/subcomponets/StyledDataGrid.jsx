import { Box, Button, Grid, Link, Typography } from "@mui/material";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import React, { forwardRef, useCallback, useRef } from "react";
import { alpha, styled } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
	[`& .${gridClasses.row}.odd`]: {
		backgroundColor: theme.palette.grey[200],
		"&:hover, &.Mui-hovered": {
			backgroundColor: theme.palette.grey[400],
			"@media (hover: none)": {
				backgroundColor: theme.palette.grey[400],
			},
		},
		"&.Mui-selected": {
			backgroundColor: alpha(theme.palette.grey[400], theme.palette.action.selectedOpacity),
			"&:hover, &.Mui-hovered": {
				backgroundColor: alpha(theme.palette.grey[400], theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity),
				// Reset on touch devices, it doesn't add specificity
				"@media (hover: none)": {
					backgroundColor: alpha(theme.palette.grey[400], theme.palette.action.selectedOpacity),
				},
			},
		},
	},
	[`& .${gridClasses.row}.even`]: {
		backgroundColor: "transparent",
		"&:hover, &.Mui-hovered": {
			backgroundColor: theme.palette.grey[400],
			"@media (hover: none)": {
				backgroundColor: theme.palette.grey[400],
			},
		},
		"&.Mui-selected": {
			backgroundColor: alpha(theme.palette.grey[400], theme.palette.action.selectedOpacity),
			"&:hover, &.Mui-hovered": {
				backgroundColor: alpha(theme.palette.grey[400], theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity),
				// Reset on touch devices, it doesn't add specificity
				"@media (hover: none)": {
					backgroundColor: alpha(theme.palette.grey[400], theme.palette.action.selectedOpacity),
				},
			},
		},
	},
}));

/**
 * Returns the hyperlink url with a trailing slash.
 * @returns {*|string}
 */
function getHyperlinkUrl(hyperlinkUrl) {
	if (!hyperlinkUrl) {
		console.log("No hyperlink provided.");
		return "";
	}

	if (hyperlinkUrl.endsWith("/")) {
		return hyperlinkUrl;
	} else {
		return hyperlinkUrl + "/";
	}
}

/**
 * Striped Data Grid component
 * @remarks by default the height is calculated by rows
 * @param {*} props
 * @param enableFiltering
 * @param enablePaging
 * @returns
 */
const StripedDataGridComponent = forwardRef((props, ref) => {
	const { columns, hyperlinkColumnFieldName, singleton, rows, loading } = props;

	/**
	 * Returns the column that has been indicated to be the hyperlink column.
	 * @returns {Object|null}
	 */
	const getHyperlinkColumn = useCallback(() => {
		if (columns && hyperlinkColumnFieldName) {
			const hyperlinkColumn = columns.filter((column) => column.field === hyperlinkColumnFieldName)[0];
			if (!hyperlinkColumn) {
				console.log("No hyperlink column found.");
			}

			return hyperlinkColumn;
		}
		return null;
	}, [columns, hyperlinkColumnFieldName]);

	const createHyperlinkColumn = useCallback(
		(hyperlinkUrl) => {
			const columnToHyperlink = getHyperlinkColumn();

			if (!columnToHyperlink) {
				//No match was made between the given field name and the column list supplied.
				return null;
			}

			return {
				field: columnToHyperlink.field,
				headerName: columnToHyperlink.headerName,
				filterable: columnToHyperlink.filterable ?? true,
				sortable: columnToHyperlink.sortable ?? true,
				flex: columnToHyperlink.flex,
				type: columnToHyperlink.type,
				renderCell: (cellValues) => {
					return (
						<Link component={RouterLink} to={`${getHyperlinkUrl(hyperlinkUrl)}${cellValues.row.id}`} underline="none">
							<Typography id={`${singleton}-${cellValues.row.id}`} color="primary" display="inline" sx={{ fontWeight: "bold" }}>
								{cellValues.row[hyperlinkColumnFieldName]}
							</Typography>
						</Link>
					);
				},
			};
		},
		[getHyperlinkColumn, hyperlinkColumnFieldName, singleton]
	);

	/**
	 * Takes a GridColDef and searches the column prop for a GridColDef which matches the field property.
	 * If the object is found then it is replaces with the passed parameter object.
	 * (https://mui.com/x/api/data-grid/grid-col-def/)
	 * @param columnToReplace
	 * @returns {Object[]|unknown[]}
	 */
	const replaceHyperlinkColumn = useCallback(
		(columnToReplace) => {
			if (columns && hyperlinkColumnFieldName) {
				return columns.map((column) => {
					if (column.field === hyperlinkColumnFieldName) {
						return columnToReplace;
					} else {
						return column;
					}
				});
			}
			return columns;
		},
		[columns, hyperlinkColumnFieldName]
	);

	return (
		<div
			style={{
				height: "20vh",
				width: "100%",
			}}
		>
			<StripedDataGrid
				{...props}
				rows={rows}
				columnVisibilityModel={props.columnVisibilityModel ?? {}}
				ref={ref}
				autoHeight={rows?.length > 0 ? true : false}
				getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
				loading={loading}
				columns={replaceHyperlinkColumn(createHyperlinkColumn(props.hyperlinkUrl))}
				pageSizeOptions={[5, 10, 15]}
				initialState={{
					pagination: {
						paginationModel: { pageSize: 10, page: 0 },
					},
				}}
				slots={{
					toolbar: props.toolbar ? props.toolbar : () => null,
				}}
			/>
		</div>
	);
});

const StyledDataGrid = (props) => {
	const ref = useRef(null);
	const { singleton, title, createPath, deleteAction } = props;
	const createLabel = `Create ${props.singleton}`;

	/**
	 * Defines all the available action buttons for the data grid and places them in a single column.
	 * @type {{disableColumnMenu: boolean, filterable: boolean, headerName: string, field: string, flex: number, sortable: boolean, align: string, renderCell: (function(*): *)}}
	 */
	const actionButtonsColumnDefinition = {
		field: "actionButtons",
		headerName: "",
		filterable: false,
		sortable: false,
		disableColumnMenu: true,
		flex: 2,
		align: "right",
		renderCell: (cellValues) => {
			return <DeleteActionButton cellValues={cellValues} deleteAction={deleteAction} singleton={singleton} />;
		},
	};

	return (
		<Box mb={2} pb={2}>
			<Header createLabel={createLabel} createPath={createPath} singleton={singleton} title={title} />
			<StripedDataGridComponent {...props} columns={[...props.columns, actionButtonsColumnDefinition]} ref={ref} />
		</Box>
	);
};

StyledDataGrid.prototypes = {
	/**
	 * The columns to be displayed in the grid.
	 */
	columns: PropTypes.array.isRequired,
	/**
	 * The rows to be displayed in the grid.
	 */
	rows: PropTypes.array.isRequired,
	/**
	 * The hyperlink column field name.
	 */
	hyperlinkColumnFieldName: PropTypes.string.isRequired,
	/**
	 * The hyperlink url.
	 */
	hyperlinkUrl: PropTypes.string.isRequired,
	/**
	 * The loading state of the grid.
	 */
	loading: PropTypes.bool.isRequired,
	/**
	 * The toolbar to be displayed in the grid.
	 */
	toolbar: PropTypes.element.isRequired,
	/**
	 * The singleton name.
	 */
	singleton: PropTypes.string.isRequired,
	/**
	 * The title of the grid.
	 */
	title: PropTypes.string.isRequired,
	/**
	 * The create path.
	 */
	createPath: PropTypes.string.isRequired,
	/**
	 * The delete action.
	 */
	deleteAction: PropTypes.func.isRequired,
};

/**
 * Defines the delete button for the data grid.
 * @param {Object} cellValues - The values of the current cell.
 * @returns {JSX.Element}
 */
const DeleteActionButton = ({ cellValues, deleteAction, singleton }) => {
	const title = `Delete ${singleton}`;
	return (
		<Button
			id={`deleteRow-${cellValues.row.id}`}
			variant="text"
			color="primary"
			onClick={() => {
				deleteAction(cellValues.row.id);
			}}
			aria-label={title}
			title={title}
			startIcon={<DeleteIcon />}
		/>
	);
};

const Header = ({ createLabel, createPath, singleton, title }) => {
	return (
		<Box pb={1} mb={1}>
			<Grid container direction="row" alignItems="center">
				<Typography id="withheader-headertitle" variant={"h4"} component="div">
					{title}
				</Typography>
				<Grid item sx={{ flexGrow: 1 }} />
				<Link id={`create-link-${singleton}`} component={RouterLink} to={{ pathname: `${createPath}` }}>
					<Grid id={`create-grid-item-${singleton}`} item ml={2}>
						<Button
							color="primary"
							variant="contained"
							size="small"
							title={createLabel}
							aria-label={createLabel}
							startIcon={<AddIcon />}
							id={`create-${singleton}`}
						>
							{createLabel}
						</Button>
					</Grid>
				</Link>
			</Grid>
		</Box>
	);
};
export default StyledDataGrid;
export { StripedDataGridComponent };
